import { ExerciseCard } from "@components/ExerciseCard";
import { Group } from "@components/Group";
import { HeaderHome } from "@components/HeaderHome";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationRoutesProps } from "@routes/app.routes";
import { VStack, FlatList, HStack, Heading, Text } from "native-base";
import { useState } from 'react'


export function Home() {
    const [isButtonActive, setIsButtonActive] = useState("Costas")
    const [groups, setGroups] = useState(["Costas", "Bíceps", "Tríceps", "Ombro",])
    const [exercises, setExercises] = useState(["Remada Unilateral", "Puxada Frontal", "Remada Curvada", "Levantamento Terra",])

    const navigation = useNavigation<AppNavigationRoutesProps>()

    function HandleOpenExerciseDetails(){
        navigation.navigate("exercise")
    }

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
                            onPress={HandleOpenExerciseDetails}
                        />
                    )}
                    data={exercises}
                    keyExtractor={item => item}
                    showsVerticalScrollIndicator={false}
                    _contentContainerStyle={{paddingBottom: 20}}
                />
            </VStack>
        </VStack>
    )
}