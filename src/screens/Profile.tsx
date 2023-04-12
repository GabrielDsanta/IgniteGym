import { useState } from "react"
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from "native-base";
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from "@hookform/resolvers/yup";

import * as ImagePicker from 'expo-image-picker'
import * as FyleSistem from 'expo-file-system'
import * as yup from 'yup'

import { TouchableOpacity } from "react-native";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { useAuth } from "@hooks/useAuth";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";

import DefaultUserPhoto from '@assets/userPhotoDefault.png'


type FormDataType = {
    name: string;
    password: string;
    oldPassword: string;
    confirmPassword: string;
    email: string;
}

const ValidationSchema = yup.object({
    name: yup.string().required('Informe o nome'),
    password: yup.string().min(6, 'A senha deve ter pelo menos 6 dígitos').nullable().transform((value) => !!value ? value : null),
    confirmPassword: yup.string()
        .nullable()
        .transform((value) => !!value ? value : null)
        .oneOf([yup.ref('password'), null as any], 'A confirmação de senha não confere')
        .when('password', {
            is: (Field: any) => Field,
            then: (schema) => schema.nullable().required('Informe a confirmação da senha.').transform((value) => !!value ? value : null)
        }),

})

export function Profile() {
    const { user, UpdateUserProfile } = useAuth()

    const [photoIsLoading, setPhotoIsLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const toast = useToast()
    const { control, handleSubmit, formState: { errors } } = useForm<FormDataType>({
        defaultValues: {
            name: user.name,
            email: user.email,
        },
        resolver: yupResolver(ValidationSchema)
    })

    async function HandleUserPhotoSelect() {
        setPhotoIsLoading(true)

        try {
            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true,

            })

            if (photoSelected.canceled) {
                return
            }

            if (photoSelected.assets[0].uri) {
                const photoSize = await FyleSistem.getInfoAsync(photoSelected.assets[0].uri)
                if (photoSize.size && photoSize.size / 1024 / 1024 > 5) {
                    return toast.show({
                        title: "Essa imagem é muito grande. Escolha uma de até 5MB",
                        placement: "top",
                        bgColor: "red.500",

                    })
                }

                const fileExtension = photoSelected.uri?.split('.').pop()

                const photoFile = {
                    name: `${user.name}.${fileExtension}`.toLowerCase(),
                    uri: photoSelected.uri,
                    type: `${photoSelected.type}/${fileExtension}`
                } as any

                const userFormUploadingPhoto = new FormData()
                userFormUploadingPhoto.append('avatar', photoFile)

                const avatarUpdatedResponse = await api.patch('/users/avatar', userFormUploadingPhoto, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                const userUpdated = user
                userUpdated.avatar = avatarUpdatedResponse.data.avatar
                UpdateUserProfile(userUpdated)

                toast.show({
                    title: 'Foto atualizada!',
                    placement: 'top',
                    bg: 'green.500'
                })
            }

        } catch (error) {
            console.log(error)
        } finally {
            setPhotoIsLoading(false)
        }

    }

    async function HandleProfileUpdate(data: FormDataType) {
        try {
            setIsLoading(true)

            const userUpdated = user
            userUpdated.name = data.name

            await api.put('/users', { name: data.name, password: data.password, old_password: data.oldPassword })

            await UpdateUserProfile(userUpdated)

            toast.show({
                title: "Perfil atualizado com sucesso !",
                placement: "top",
                bgColor: "green.500",

            })

        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : "Não foi possível atualizar os dados. Tente novamente mais tarde"
            toast.show({
                title,
                placement: "top",
                bgColor: "red.500",

            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <VStack flex={1}>
            <ScreenHeader title="Perfil" />
            <ScrollView contentContainerStyle={{ paddingBottom: 56 }}>
                <Center mt={6} px={10}>
                    {photoIsLoading ? (
                        <Skeleton
                            w={33}
                            h={33}
                            rounded="full"
                            startColor="gray.500"
                            endColor="gray.400"
                        />
                    ) : (
                        <UserPhoto
                            size={33}
                            source={user.avatar ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } : DefaultUserPhoto}
                            alt="Foto do usuário"
                        />
                    )}

                    <TouchableOpacity onPress={HandleUserPhotoSelect}>
                        <Text color="green.500" fontWeight="bold" fontSize="md" mt={4} mb={8}>
                            Alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Controller
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Input
                                placeholder="Nome"
                                bg="gray.600"
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.name?.message}
                            />
                        )}
                        name="name"
                    />

                    <Controller
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Input
                                placeholder="Email"
                                bg="gray.600"
                                isDisabled
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                        name="email"
                    />

                </Center>

                <VStack px={10} mb={9} mt={8}>
                    <Heading fontFamily="heading" color="gray.200" fontSize="md" mb={2}>
                        Alterar senha
                    </Heading>

                    <Controller
                        control={control}
                        render={({ field: { onChange } }) => (
                            <Input
                                placeholder="Senha antiga"
                                bg="gray.600"
                                secureTextEntry
                                onChangeText={onChange}
                            />
                        )}
                        name="oldPassword"
                    />

                    <Controller
                        control={control}
                        render={({ field: { onChange } }) => (
                            <Input
                                placeholder="Nova senha"
                                bg="gray.600"
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.password?.message}
                            />
                        )}
                        name="password"
                    />

                    <Controller
                        control={control}
                        render={({ field: { onChange } }) => (
                            <Input
                                placeholder="Confirme nova senha"
                                bg="gray.600"
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.confirmPassword?.message}
                            />
                        )}
                        name="confirmPassword"
                    />

                    <Center mt={4}>
                        <Button
                            onPress={handleSubmit(HandleProfileUpdate)}
                            isLoading={isLoading}
                            title="Atualizar"
                        />
                    </Center>

                </VStack>
            </ScrollView>
        </VStack>
    )
}