import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        // 테마 구분을 위한 이름
        name: string;

        // Celestial 테마 색상
        celestial: {
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

        // 폰트 크기
        fontSizes: {
            h1: string;
            h2: string;
            h3: string;
            h4: string;
            body: string;
            caption: string;
            label: string;
        };

        // 폰트 굵기
        fontWeights: {
            light: number;
            regular: number;
            medium: number;
            bold: number;
        };

        // 줄 높이
        lineHeights: {
            body: number;
            heading: number;
        };

        // 폰트 종류
        fonts: {
            celestial_heading: string;
            body: string;
        };
    }
}
