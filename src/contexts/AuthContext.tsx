import { User } from "@models/User";
import { api } from "@services/api";
import { StorageAuthTokenGet, StorageAuthTokenRemove, StorageAuthTokenSave } from "@storage/storageAuthToken";
import { StorageUserGet, StorageUserSave, StorageUserRemove } from "@storage/storageUser";
import { ReactNode, createContext, useEffect, useState } from "react";

export type AuthContextDataProps = {
    user: User;
    isLoadingStorageData: boolean;
    SignIn: (email: string, password: string) => Promise<void>
    SignOut: () => Promise<void>;
    UpdateUserProfile: (data: User) => Promise<void>
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)

type AuthContextProviderProps = {
    children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<User>({} as User)
    const [isLoadingStorageData, setIsLoadingStorageData] = useState(true)

    async function SignIn(email: string, password: string) {
        try {
            const { data } = await api.post("/sessions", { email, password })

            if (data.user && data.token && data.refresh_token) {
                setIsLoadingStorageData(true)

                await StorageUserAndTokenSave(data.user, data.token, data.refresh_token)

                UserAndTokenUpdate(data.user, data.token)
            }
        } catch (error) {
            throw error
        } finally {
            setIsLoadingStorageData(false)
        }
    }

    async function LoadUserData() {
        try {
            setIsLoadingStorageData(true)

            const isUserLoged = await StorageUserGet()
            const { token } = await StorageAuthTokenGet()

            isUserLoged && token && UserAndTokenUpdate(isUserLoged, token)

        } catch (error) {
            throw error
        } finally {
            setIsLoadingStorageData(false)
        }

    }

    async function SignOut() {
        try {
            setIsLoadingStorageData(true)

            setUser({} as User)

            await StorageUserRemove()
            await StorageAuthTokenRemove()

        } catch (error) {
            throw error
        } finally {
            setIsLoadingStorageData(false)
        }
    }

    async function UserAndTokenUpdate(userData: User, token: string) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`

        setUser(userData)
    }

    async function StorageUserAndTokenSave(userData: User, token: string, refreshToken: string) {
        try {
            setIsLoadingStorageData(true)

            await StorageUserSave(userData)
            await StorageAuthTokenSave({ token, refreshToken })

        } catch (error) {
            throw error
        } finally {
            setIsLoadingStorageData(false)
        }
    }

    async function UpdateUserProfile(data: User) {
        try {
            setUser(data)
            await StorageUserSave(data)
        } catch (error) {
            throw error
        }
    }

    useEffect(() => {
        LoadUserData()
    }, [])

    useEffect(() => {
        const subscribe = api.registerInterceptTokenManager(SignOut)
        return () => {
            subscribe()
        }
    }, [SignOut])

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoadingStorageData,
                SignIn,
                SignOut,
                UpdateUserProfile
            }}
        >
            {children}

        </AuthContext.Provider>
    )
}

