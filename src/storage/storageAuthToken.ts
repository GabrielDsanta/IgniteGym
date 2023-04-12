import AsyncStorage from "@react-native-async-storage/async-storage"

import { AUTH_TOKEN_STORAGE } from "./storageConfig"

type StorageAuthTokenProps = {
    token: string;
    refreshToken: string;
}

export async function StorageAuthTokenSave({ token, refreshToken }: StorageAuthTokenProps) {
    await AsyncStorage.setItem(AUTH_TOKEN_STORAGE, JSON.stringify({ token, refreshToken }))
}

export async function StorageAuthTokenGet() {
    const response = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE)

    const { token, refreshToken }: StorageAuthTokenProps = response ? JSON.parse(response) : {}

    return { token, refreshToken }
}

export async function StorageAuthTokenRemove() {
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE)
}

