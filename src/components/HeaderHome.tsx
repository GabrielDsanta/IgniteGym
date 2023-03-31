import { Heading, HStack, Icon, Text, VStack } from 'native-base'
import { TouchableOpacity } from 'react-native'
import { UserPhoto } from './UserPhoto'
import { MaterialIcons } from '@expo/vector-icons'

export function HeaderHome() {
    return (
        <HStack bg='gray.600' pt={16} pb={5} px={8} alignItems='center'>

            <UserPhoto
                source={{ uri: 'https://github.com/GabrielDSanta.png' }}
                size={16}
                alt='Imagem Do Usuário'
                mr={4}
            />

            <VStack flex={1}>
                <Text color='gray.100' fontSize='md'>
                    Olá
                </Text>

                <Heading color='gray.100' fontSize='md' fontFamily="heading">
                    Gabriel Santana
                </Heading>
            </VStack>

            <TouchableOpacity>
                <Icon
                    as={MaterialIcons}
                    name='logout'
                    color='gray.200'
                    size={7}
                />
            </TouchableOpacity>

        </HStack>
    )
}