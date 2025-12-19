"use client"

import { ThemeProvider } from 'styled-components';
import { themes } from '@/styles/theme';
import { useEffect, useState } from 'react';

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState(themes.celestial);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('user-theme');
        if (savedTheme && themes.celestial) {
            setCurrentTheme(themes.celestial);
        }
        setIsLoaded(true);
    }, []);

    const toggleTheme = (themeName: 'celestial' | 'light') => {
        setCurrentTheme(themes[themeName]);
        localStorage.setItem('user-theme', themeName);
    };

    if (!isLoaded) return <div style={{ visibility: 'hidden' }}>{children}</div>;

    return (
        <ThemeProvider theme={currentTheme}>
            {children}
        </ThemeProvider>
    );
}
