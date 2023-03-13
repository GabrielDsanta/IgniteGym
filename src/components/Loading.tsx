import { Spinner, Center } from 'native-base'

export function Loading(){
    return(
        <Center style={{flex: 1}} bg='gray.700'>
            <Spinner color='green.500' />
        </Center>
    )
}