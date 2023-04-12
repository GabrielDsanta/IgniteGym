import { ExerciseCard } from "@components/ExerciseCard";
import { Group } from "@components/Group";
import { HeaderHome } from "@components/HeaderHome";
import { Loading } from "@components/Loading";
import { ExerciseType } from "@models/Exercise";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppNavigationRoutesProps } from "@routes/app.routes";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { VStack, FlatList, HStack, Heading, Text, useToast } from "native-base";
import { useCallback, useEffect, useState } from 'react'


export function Home() {
    const [isLoading, setIsLoading] = useState(false)
    const [isButtonActive, setIsButtonActive] = useState("antebraço")
    const [groups, setGroups] = useState(["Costas", "Bíceps", "Tríceps", "Ombro",])
    const [exercises, setExercises] = useState<ExerciseType[]>([])

    const navigation = useNavigation<AppNavigationRoutesProps>()
    const toast = useToast()

    function HandleOpenExerciseDetails(exerciseId: string) {
        navigation.navigate("exercise", { exerciseId })
    }

    async function FetchGroups() {
        try {
            const response = await api.get("/groups")
            setGroups(response.data)
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : "Não foi possível carregar os grupos musculares"

            toast.show({
                title,
                bg: "red.500",
                placement: "top"
            })
        }
    }

    async function FetchExercises() {
        try {
            setIsLoading(true)
            const response = await api.get(`exercises/bygroup/${isButtonActive}`)
            setExercises(response.data)
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : "Não foi possível carregar os exercicios"

            toast.show({
                title: title,
                bg: "red.500",
                placement: "top"
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        FetchGroups()
    }, [])

    useFocusEffect(useCallback(() => {
        FetchExercises()
    }, [isButtonActive]))

    return (

        <VStack flex={1}>
            <HeaderHome />

            <FlatList
                renderItem={({ item }) => (
                    <Group
                        isActive={isButtonActive === item}
                        name={item}
                        onPress={() => setIsButtonActive(item)}
                    />
                )}
                data={groups}
                keyExtractor={item => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                _contentContainerStyle={{ px: 8 }}
                my={10}
                maxH={10}
                minH={10}
            />

            {isLoading ? <Loading /> :
                <VStack px={8} flex={1}>
                    <HStack justifyContent="space-between" mb={5}>
                        <Heading fontFamily="heading" color="gray.200" fontSize="md">
                            Exercícios
                        </Heading>

                        <Text color="gray.200" fontSize="sm">
                            {exercises.length}
                        </Text>
                    </HStack>

                    <FlatList
                        renderItem={({ item }) => (
                            <ExerciseCard
                                data={item}
                                onPress={() => HandleOpenExerciseDetails(item.id)}
                            />
                        )}
                        data={exercises}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        _contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </VStack>
            }
        </VStack>
    )
}