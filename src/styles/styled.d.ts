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

        /**
         * 위젯 창은 surface/text를 배경에 맞게 덮어쓴다.
         * 그 창에서도 원래 앱 색상이 필요한 요소(모달 등)를 위해 원본을 보존한다.
         */
        baseColors?: DefaultTheme['colors'];

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
            celestial: string;
            body: string;
        };
    }
}
