import { VStack, Image, Text, Center, Heading, ScrollView } from "native-base"
import BackgroundImage from "@assets/background.png"
import { useNavigation } from "@react-navigation/native"

import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import LogoSvg from "@assets/logo.svg"
import { Input } from "@components/Input"
import { Button } from "@components/Button"
import { AuthNavigationRoutesProps } from "@routes/auth.routes"
import { Controller, useForm } from "react-hook-form"

type FormDataProps = {
    email: string;
    password: string;
}

const ValidationSchemaForm = yup.object({
    email: yup.string().required("Informe o e-mail").email("E-mail inválido"),
    password: yup.string().required("Informe a senha").min(6, "A senha deve possuir no mínimo 6 dígitos"),
})

export function SignIn() {
    const navigation = useNavigation<AuthNavigationRoutesProps>()

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        resolver: yupResolver(ValidationSchemaForm)
    })

    function handleNewAccount() {
        navigation.navigate('signUp')
    }

    function handleSignIn(data: FormDataProps) {

    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <VStack flex={1} bg="gray.700" px={10}>
                <Image
                    source={BackgroundImage}
                    defaultSource={BackgroundImage}
                    alt="Pessoas Treinando"
                    resizeMode="contain"
                    position="absolute"
                />

                <Center my={24}>
                    <LogoSvg />

                    <Text color="gray.100" fontSize="sm">
                        Treie sua mente e o seu corpo
                    </Text>
                </Center>

                <Center>
                    <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
                        Acesse sua conta
                    </Heading>

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

                    <Button
                        onPress={handleSubmit(handleSignIn)}
                        title="Acessar"
                    />
                </Center>

                <Center mt={20}>
                    <Text color="gray.100" fontSize="sm" mb={3} fontFamily="body">
                        Ainda não tem acesso ?
                    </Text>

                    <Button
                        title="Criar conta"
                        onPress={handleNewAccount}
                        variant="outline"
                    />
                </Center>
            </VStack>
        </ScrollView>
    )
}