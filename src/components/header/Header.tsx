"use client"

import {useTheme} from "styled-components";
import Celestial_Header from "@/components/header/Celestial_Header";

const Header = () => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (themeName == 'celestial') {
        return <Celestial_Header></Celestial_Header>
    }
}

export default Header
