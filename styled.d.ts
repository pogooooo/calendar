// src/styled.d.ts

import 'styled-components';
import theme from './src/styles/theme'; // 1. 우리가 만든 theme.js 파일을 import 합니다.

// 2. theme.js 파일의 타입을 추론하여 ThemeType 이라는 타입을 만듭니다.
type ThemeType = typeof theme;

// 3. styled-components의 DefaultTheme 타입을 확장하여 우리 테마의 타입을 알려줍니다.
declare module 'styled-components' {
    export interface DefaultTheme extends ThemeType {}
}