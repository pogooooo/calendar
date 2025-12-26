"use client"

import {useTheme} from "styled-components";
import Celestial_SideBar from "@/components/sideBar/Celestial_SideBar";

const Header = () => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (themeName == 'celestial') {
        return <Celestial_SideBar></Celestial_SideBar>
    }
}

export default Header
