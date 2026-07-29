import { DefaultTheme } from "styled-components";

const commonStyles = {
    fontSizes: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.5rem',
        h4: '1.25rem',
        body: '1rem',
        caption: '0.875rem',
        label: '0.75rem',
    },
    fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700,
    },
    lineHeights: {
        body: 1.5,
        heading: 1.2,
    },
    fonts: {
        celestial: "'Orbit', serif",
        body: "'Inter', sans-serif",
    },
};

const celestial: DefaultTheme = {
    name: 'celestial',
    ...commonStyles,
    colors: {
        background: '#FFFFFF',
        primary: '#D4AF37',
        accent: '#FAE7B5',
        surface: '#F9F9F9',
        text: '#2E2E2E',
        textSecondary: '#7A7A7A',
        border: '#D4AF37',
        success: '#4E8A6D',
        error: '#A13D4B',
    },
};

const celestialDark: DefaultTheme = {
    name: 'celestial-dark',
    ...commonStyles,
    colors: {
        background: '#111111',
        primary: '#D4AF37',
        accent: '#FAE7B5',
        surface: '#1A1A1A',
        text: '#E8E8E8',
        textSecondary: '#888888',
        border: '#D4AF37',
        success: '#4E8A6D',
        error: '#A13D4B',
    },
};

export const themes = {
    celestial,
    'celestial-dark': celestialDark,
};

export default celestial;
