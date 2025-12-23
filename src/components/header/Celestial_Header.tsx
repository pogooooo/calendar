import styled from "styled-components";
import {useRouter} from "next/navigation";

const HeaderWrapper = styled.div`
    background-color: ${(props) => props.theme.colors.surface};
    padding: 0 10px;
    margin-bottom: 7px;
    display: flex;
    position: sticky;
    top: 0;
    
    border-bottom: 1px solid ${(props) => props.theme.colors.primary};
    
    &::after{
        border-bottom: 1px solid ${(props) => props.theme.colors.primary};
        width: 80%;
        position: absolute;
        bottom: -7px;
        left: 0;
        content: "";
    }
`

const Logo = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-family: ${(props) => props.theme.fonts.celestial_heading};
    font-size: ${(props) => props.theme.fontSizes.h4};
    
    cursor: pointer;
`

const Celestial_Header = () => {
    const router = useRouter();

    return(
        <HeaderWrapper>
            <Logo onClick={() => {router.push("/")}}>CRONOS</Logo>
        </HeaderWrapper>
    )
}

export default Celestial_Header
