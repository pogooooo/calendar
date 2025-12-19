import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        name: string;

        colors: {
            background: string;
            primary: string;
            accent: string;
            surface: string;
            text: string;
            textSecondary: string;
            border: string;
            success: string;
            error: string;
        };

        fontSizes: {
            h1: string;
            h2: string;
            h3: string;
            h4: string;
            body: string;
            caption: string;
            label: string;
        };

        fontWeights: {
            light: number;
            regular: number;
            medium: number;
            bold: number;
        };

        lineHeights: {
            body: number;
            heading: number;
        };

        fonts: {
            celestial_heading: string;
            body: string;
        };
    }
}
