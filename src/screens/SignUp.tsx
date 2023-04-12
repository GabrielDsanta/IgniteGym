import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from "native-base"
import BackgroundImage from "@assets/background.png"
import { useNavigation } from "@react-navigation/native"
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import LogoSvg from "@assets/logo.svg"
import { Input } from "@components/Input"
import { Button } from "@components/Button"

import { useForm, Controller } from 'react-hook-form'
import { api } from "@services/api"
import { AppError } from "@utils/AppError"
import { useState } from "react"
import { useAuth } from "@hooks/useAuth"

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    password_confirm: string;
}

const ValidationSchemaForm = yup.object({
    name: yup.string().required("Informe o nome"),
    email: yup.string().required("Informe o e-mail").email("E-mail inválido"),
    password: yup.string().required("Informe a senha").min(6, "A senha deve possuir no mínimo 6 dígitos"),
    password_confirm: yup.string().required("Confirme a senha").oneOf([yup.ref("password")], "A confirmação da senha não confere"),
})


export function SignUp() {
    const { SignIn } = useAuth()
    const [isLoading, setIsLoading] = useState(false)

    const navigation = useNavigation()
    const toast = useToast()

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        resolver: yupResolver(ValidationSchemaForm)
    })

    function handleGoBack() {
        navigation.goBack()
    }

    async function handleSignUp({ name, email, password }: FormDataProps) {

        const newUserToSignUp = {
            name: name,
            email: email,
            password: password
        }

        try {
            setIsLoading(true)
            await api.post("/users", newUserToSignUp)
            await SignIn(email, password)

        } catch (error) {
            setIsLoading(false)

            const isAppErrorInstance = error instanceof AppError
            const title = isAppErrorInstance ? error.message : "Não foi possível criar a conta. Tente mais tarde"

            toast.show({
                title,
                placement: "top",
                bg: "red.500"
            })
        }
        

    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <VStack flex={1} bg="gray.700" px={10} pb={10}>
                <Image
                    source={BackgroundImage}
                    defaultSource={BackgroundImage}
                    alt="Pessoas Treinando"
                    resizeMode="contain"
                    position="absolute"
                />

                <Center mt={20} mb={10}>
                    <LogoSvg />

                    <Text color="gray.100" fontSize="sm">
                        Treie sua mente e o seu corpo
                    </Text>
                </Center>

                <Center>
                    <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
                        Crie sua conta
                    </Heading>

                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="Nome"
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="E-mail"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="Senha"
                                secureTextEntry
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.password?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password_confirm"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="Confirme a senha"
                                secureTextEntry
                                onChangeText={onChange}
                                value={value}
                                onSubmitEditing={handleSubmit(handleSignUp)}
                                returnKeyType="send"
                                errorMessage={errors.password_confirm?.message}
                            />
                        )}
                    />

                    <Button
                        onPress={handleSubmit(handleSignUp)}
                        title="Criar e Acessar"
                        isLoading={isLoading}
                    />
                </Center>

                <Button
                    mt={20}
                    title="Voltar para o login"
                    variant="outline"
                    onPress={handleGoBack}
                />

            </VStack>
        </ScrollView>
    )
}