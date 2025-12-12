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
        celestial_heading: "'Orbit', serif",
        body: "'Inter', sans-serif",
    },
};

const celestial: DefaultTheme = {
    name: 'celestial',
    ...commonStyles,
    celestial: {
        background: '#FFFFFF',
        primary: '#D4AF37',
        accent: '#FAE7B5',
        surface: '#F9F9F9',
        text: '#2E2E2E',
        textSecondary: '#7A7A7A',
        border: '#EAEAEA',
        success: '#4E8A6D',
        error: '#A13D4B',
    },
};

const light: DefaultTheme = {
    name: 'light',
    ...commonStyles,
    celestial: {
        background: '#ffffff',
        primary: '#007bff',
        accent: '#0056b3',
        surface: '#ffffff',
        text: '#000000',
        textSecondary: '#666666',
        border: '#cccccc',
        success: '#28a745',
        error: '#dc3545',
    },
};

export const themes = {
    celestial,
    light,
};

export default celestial;
