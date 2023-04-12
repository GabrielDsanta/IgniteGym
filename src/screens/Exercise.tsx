import { Box, Center, Heading, HStack, Icon, Image, ScrollView, Text, useToast, VStack } from "native-base";
import { TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons"
import IconBody from "@assets/body.svg"
import IconSeries from "@assets/series.svg"
import IconRepetitions from "@assets/repetitions.svg"
import { Button } from "@components/Button";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { useEffect, useState } from "react";
import { ExerciseType } from "@models/Exercise";
import { Loading } from "@components/Loading";


type RoutesParamsProps = {
    exerciseId: string;
}

export function Exercise() {
    const [sendingSubmit, setsendingSubmit] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [exerciseData, setExerciseData] = useState<ExerciseType>({} as ExerciseType)
    const navigation = useNavigation()

    const toast = useToast()

    const route = useRoute()
    const { exerciseId } = route.params as RoutesParamsProps

    async function LoadExerciseById() {
        try {
            setIsLoading(true)
            const response = await api.get(`/exercises/${exerciseId}`)
            setExerciseData(response.data)
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : "Não foi possível carregar os detalhes exercício"

            toast.show({
                title,
                bg: "red.500",
                placement: "top"
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function HandleExerciseHistoryRegister() {
        try {
            setsendingSubmit(true)
            await api.post(`/history`, { exercise_id: exerciseId })

            toast.show({
                title: "Paranbéns! Exercício registrado no seu histórico",
                bg: "green.700",
                placement: "top"
            })

            navigation.navigate("history" as never)
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : "Não foi possível registrar o exercício"

            toast.show({
                title,
                bg: "red.500",
                placement: "top"
            })
        } finally {
            setsendingSubmit(false)
        }
    }

    function HandleGoBack() {
        navigation.goBack()
    }


    useEffect(() => {
        LoadExerciseById()
    }, [exerciseId])

    return (
        <VStack flex={1}>
            <VStack px={8} bg="gray.600" pt={12}>
                <TouchableOpacity onPress={HandleGoBack}>
                    <Icon
                        as={Feather}
                        name="arrow-left"
                        color="green.500"
                        size={6}
                    />
                </TouchableOpacity>

                <HStack justifyContent="space-between" mt={4} mb={8} alignItems="center">
                    <Heading fontFamily="heading" color="gray.100" fontSize="lg" flexShrink={1}>
                        {exerciseData.name}
                    </Heading>

                    <HStack alignItems="center">
                        <IconBody />
                        <Text color="gray.200" ml={1} textTransform="capitalize">
                            {exerciseData.group}
                        </Text>
                    </HStack>
                </HStack>
            </VStack>

            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <Center mt={220}>
                        <Loading />
                    </Center>
                ) : (
                    <VStack p={8}>
                        <Image
                            w="full"
                            h={80}
                            source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exerciseData.demo}` }}
                            alt={exerciseData.name}
                            mb={3}
                            resizeMode="cover"
                            rounded="lg"
                        />

                        <Box bg="gray.600" rounded="md" pb={4} px={4}>
                            <HStack alignItems="center" justifyContent="space-around" mb={6} mt={5}>
                                <HStack>
                                    <IconSeries />
                                    <Text color="gray.200" ml="2">
                                        {exerciseData.series} séries
                                    </Text>
                                </HStack>

                                <HStack>
                                    <IconRepetitions />
                                    <Text color="gray.200" ml="2">
                                        {exerciseData.repetitions} repetições
                                    </Text>
                                </HStack>
                            </HStack>

                            <Button
                                title="Marcar como realizado"
                                isLoading={sendingSubmit}
                                onPress={HandleExerciseHistoryRegister}
                            />
                        </Box>
                    </VStack>
                )}
            </ScrollView>
        </VStack>
    )
}