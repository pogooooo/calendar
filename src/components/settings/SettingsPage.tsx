"use client";

import { useTheme } from "styled-components";
import useSettingStore from "@/store/useSettingStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import CelestialSettings from "./celestial/CelestialSettings";

export default function SettingsPage() {
    const theme = useTheme();
    const themeName = theme?.name || "celestial";

    const { theme: currentTheme, updateTheme } = useSettingStore();
    const authFetch = useAuthFetch();

    const handleThemeChange = (themeId: string) => {
        updateTheme(authFetch, themeId);
    };

    if (themeName === "celestial") {
        return (
            <CelestialSettings
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
            />
        );
    }

    // light 등 추가 테마는 여기에 분기
    return (
        <CelestialSettings
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
        />
    );
}
