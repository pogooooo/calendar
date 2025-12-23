import styled from "styled-components";

interface ErrorProps {
    children?: string;
    className?: string;
}

const ErrMessage = styled.div`
    color: ${(props) => props.theme.colors.error};
    font-size: ${(props) => props.theme.fontSizes.label};
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 1.5rem;
`

export default function InlineError({ children, className }: ErrorProps) {
    return <ErrMessage className={className}>{children}</ErrMessage>;
}
