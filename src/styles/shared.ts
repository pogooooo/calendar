import { css } from "styled-components";

/**
 * 테마와 상관없는 조각들.
 *
 * 예전에는 이런 것들이 celestial_theme.ts 에 섞여 있었다. 이름이 celestial_ 로
 * 시작하니, 테마와 무관한 컴포넌트(사이드바 Profile 등)까지 그 파일을 끌어다 썼고,
 * 두 번째 테마를 만들면 그 파일을 통째로 베껴야 하는 모양이 된다.
 * 모든 테마가 그대로 써도 되는 것만 여기 둔다.
 */

/** 스크롤은 살리고 막대만 감춘다. */
export const hide_scrollbar = css`
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
    }
`;
