import { Button as ButtonNativeBase, Text, IButtonProps } from "native-base"

type ButtonProps = IButtonProps & {
    title: string;
}

export function Button({ title, ...rest }: ButtonProps) {
    return (
        <ButtonNativeBase
            {...rest}
        >
            <Text>
                {title}
            </Text>
        </ButtonNativeBase>
    )
}