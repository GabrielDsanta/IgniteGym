import { useState } from "react"
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from "native-base";
import * as ImagePicker from 'expo-image-picker'
import * as FyleSistem from 'expo-file-system'
import { TouchableOpacity } from "react-native";
import { Input } from "@components/Input";
import { Button } from "@components/Button";


export function Profile() {
    const [photoIsLoading, setPhotoIsLoading] = useState(false)
    const [userPhoto, setUserPhoto] = useState("https://github.com/GabrielDSanta.png")

    const toast = useToast()

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
                if(photoSize.size && photoSize.size / 1024 / 1024 > 5){
                    return toast.show({
                        title: "Essa imagem é muito grande. Escolha uma de até 5MB",
                        placement: "top",
                        bgColor: "red.500",

                    })
                }
                setUserPhoto(photoSelected.assets[0].uri)
            }

        }catch (error) {
            console.log(error)
        }finally{
            setPhotoIsLoading(false)
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
                            source={{ uri: userPhoto }}
                            alt="Foto do usuário"
                        />
                    )}

                    <TouchableOpacity onPress={HandleUserPhotoSelect}>
                        <Text color="green.500" fontWeight="bold" fontSize="md" mt={4} mb={8}>
                            Alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Input
                        placeholder="Nome"
                        bg="gray.600"
                    />

                    <Input
                        placeholder="Email"
                        bg="gray.600"
                        isDisabled
                    />
                </Center>

                <VStack px={10} mb={9} mt={8}>
                    <Heading fontFamily="heading" color="gray.200" fontSize="md" mb={2}>
                        Alterar senha
                    </Heading>

                    <Input
                        placeholder="Senha antiga"
                        bg="gray.600"
                        secureTextEntry
                    />

                    <Input
                        placeholder="Nova senha"
                        bg="gray.600"
                        secureTextEntry
                    />

                    <Input
                        placeholder="Confirme nova senha"
                        bg="gray.600"
                        secureTextEntry
                    />

                    <Center mt={4}>
                        <Button title="Atualizar" />
                    </Center>

                </VStack>
            </ScrollView>
        </VStack>
    )
}