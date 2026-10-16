import 'styled-components';
import type { ThemeFamily } from './themed';

declare module 'styled-components' {
    export interface DefaultTheme {
        /** 저장·복원에 쓰는 고유 이름. 예: 'celestial', 'celestial-dark' */
        name: string;

        /**
         * 어느 테마 갈래인가. 밝음/어둠 짝은 같은 갈래를 공유한다.
         * 화면 구현을 고를 때 이 값을 쓴다 (styles/themed.ts).
         */
        family: ThemeFamily;

        /**
         * 밝은 벌인가 어두운 벌인가.
         * 예전에는 이름이 '-dark' 로 끝나는지 보고 판단했는데,
         * 테마가 늘면 이름 규칙이 먼저 깨진다.
         */
        mode: 'light' | 'dark';

        /**
         * 밝기 말고 결이 다른 벌 — 같은 갈래·같은 밝기 안에서 재료가 바뀐다(Maple 의 빛바랜 '빈티지').
         * 이름은 '갈래-벌'(maple-vintage)이고 설정의 벌 고르기에 밝게·어둡게와 나란히 선다. 없으면 보통 벌.
         */
        variant?: 'vintage';

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
            /** 주말·휴일 표시. 예전에는 컴포넌트에 #d97878 로 박혀 있었다. */
            weekend: string;
        };

        /**
         * 설정 화면의 축소판 미리보기에만 쓰는 색.
         * 팔레트만으로는 안 나오는 미묘한 단계(빈 칸, 일정 칠)가 있다.
         */
        preview: {
            cell: string;
            event: string;
            /** 바탕·옆줄을 색 대신 그림(그라데이션·무늬)으로 칠하고 싶은 갈래만 (바다의 물·모래) */
            bg?: string;
            rail?: string;
            /** 오늘 칸 — 없으면 primary */
            today?: string;
        };

        /**
         * 위젯 창은 surface/text를 배경에 맞게 덮어쓴다.
         * 그 창에서도 원래 앱 색상이 필요한 요소(모달 등)를 위해 원본을 보존한다.
         */
        baseColors?: DefaultTheme['colors'];

        /**
         * 앱 틀(스크롤바·창 제목줄)의 실선 색. 없으면 primary 를 쓴다 (Celestial 의 금빛 실선).
         * Maple 은 붉은 primary 대신 먹을 준다 — 틀은 조용해야 한다. 뒤에 알파 두 자리를 붙여 쓰므로 hex 여야 한다.
         */
        line?: string;

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
            /**
             * 제목·표지에 쓰는 글꼴. 예전 이름은 celestial 이었는데,
             * 테마 이름을 토큰에 박아 두면 다른 테마도 그 칸을 채워야 한다.
             */
            display: string;
            /** 시각·날짜 숫자에 쓰는 글꼴. 표시 글꼴과 같을 수도(Celestial), 라틴 세리프일 수도(Maple) 있다 */
            numeral: string;
            body: string;
        };
    }
}
