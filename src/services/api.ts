import { StorageAuthTokenGet, StorageAuthTokenSave } from '@storage/storageAuthToken';
import { AppError } from '@utils/AppError';
import axios, { AxiosError, AxiosInstance } from 'axios';

type SignOut = () => void

type PromiseType = {
  onSucess: (token: string) => void;
  onFailure: (token: AxiosError) => void;
}

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void
}

export const api = axios.create({
  baseURL: 'http://10.0.2.2:3333',
  timeout: 10000,
}) as APIInstanceProps;

let failedQueue: PromiseType[] = []
let isRefreshing = false

api.registerInterceptTokenManager = signOut => {
  const interceptTokenManager = api.interceptors.response.use((response) => response, async (requestError) => {
    if (requestError?.response?.status === 401) {
      if (requestError.response.data?.message === "token.expired" || requestError.response.data?.message === "token.invalid") {
        const { refreshToken } = await StorageAuthTokenGet()

        if (!refreshToken) {
          signOut()
          return Promise.reject(requestError)
        }

        const originalRequestConfig = requestError.config

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              onSucess: (token: string) => {
                originalRequestConfig.headers = { "Authorization": `Bearer ${token}` }
                resolve(api(originalRequestConfig))
              },
              onFailure: (error: AxiosError) => {
                reject(error)
              },
            })
          })
        }

        isRefreshing = true

        return new Promise(async (resolve, reject) => {
          try {
            const { data } = await api.post('/sessions/refresh-token', {
              refresh_token: refreshToken
            })

            await StorageAuthTokenSave({
              token: data.token,
              refreshToken: data.refresh_token
            })

            if (originalRequestConfig.data) {
              originalRequestConfig.data = JSON.parse(originalRequestConfig.data)
            }

            originalRequestConfig.headers = { "Authorization": `Bearer ${data.token}` }
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

            failedQueue.forEach((item) => {
              item.onSucess(data.token)
            })

            resolve(api(originalRequestConfig))

          } catch (error: any) {
            failedQueue.forEach((item) => {
              item.onFailure(error)
            })

            signOut()
            reject(error)

          } finally {
            isRefreshing = false
            failedQueue = []
          }
        })
      }

      signOut()
    }

    if (requestError.response && requestError.response.data) {
      return Promise.reject(new AppError(requestError.response.data.message))
    } else {
      return Promise.reject(new AppError('Erro no servidor. Por favor tente novamente mais tarde'))
    }

  })

  return () => {
    api.interceptors.response.eject(interceptTokenManager)
  }
}
