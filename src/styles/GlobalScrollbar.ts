import { createGlobalStyle } from "styled-components";

/**
 * 앱 전체의 스크롤바 — 눈금자.
 *
 * 트랙에 눈금을 새기고 막대를 얇게 깎았다. 자리를 많이 먹지 않으면서도
 * 얼마나 왔고 얼마나 남았는지 눈금으로 읽힌다.
 *
 * ── 브라우저를 갈라 주는 이유 ────────────────────────────────────────
 * Chromium 은 표준 scrollbar-width / scrollbar-color 가 지정돼 있으면
 * ::-webkit-scrollbar 커스터마이징을 통째로 무시한다. 예전에는 * 규칙에
 * scrollbar-width: thin 이 함께 걸려 있어서, 아래의 정교한 트랙·막대 스타일이
 * 크롬에서 한 줄도 먹지 않고 브라우저 기본 얇은 막대만 나왔다.
 *
 * 그래서 표준 속성은 ::-webkit-scrollbar 를 모르는 브라우저(파이어폭스)에만
 * 준다. 크로미움은 아래 의사요소로, 파이어폭스는 표준 속성으로 그린다.
 *
 * 여기가 스크롤바의 유일한 출처다. 곳마다 따로 손대지 말고 이 파일을 고칠 것.
 * 감춰야 하는 곳만 hide_scrollbar 로 덮는다.
 * 눈금이 실제 값을 가리켜야 하는 곳(시각·주 단위)에는
 * components/scroll/RulerScroll 을 쓴다.
 */
const GlobalScrollbar = createGlobalStyle`
    /* ── 파이어폭스 등: 표준 속성만 지원하는 브라우저 ─────────────────── */
    @supports (scrollbar-width: thin) and (not selector(::-webkit-scrollbar)) {
        * {
            scrollbar-width: thin;
            scrollbar-color: ${(props) => props.theme.colors.primary} transparent;
        }
    }

    /* ── 크로미움·웹킷: 여기서부터 눈금자 ───────────────────────────────
       손가락으로 쓰는 화면은 빼둔다. ::-webkit-scrollbar 를 건드리는 순간
       안드로이드 웹뷰의 겹쳐 뜨는 막대가 자리를 차지하는 옛날 막대로 바뀌어,
       스크롤되는 칸마다 13px 씩 폭을 잃는다. 터치에서는 굴리면 그만이라
       눈금이 없어도 아쉽지 않다. */
    @media (hover: hover) {
    *::-webkit-scrollbar {
        width: 13px;
        height: 13px;
        background: transparent;
    }

    /* 세로 트랙: 9px 마다 눈금 한 칸. 오른쪽에 붙여 본문과 겹치지 않는다. */
    *::-webkit-scrollbar-track {
        background-color: transparent;
        background-image: repeating-linear-gradient(
            to bottom,
            ${(props) => props.theme.colors.primary}66 0 1px,
            transparent 1px 9px
        );
        background-repeat: repeat-y;
        background-position: right;
        background-size: 7px 100%;
        border-left: 1px solid ${(props) => props.theme.colors.primary}33;
    }

    /* 가로 스크롤에는 눈금을 새기지 않는다. 세로처럼 읽어 내릴 일이 없다. */
    *::-webkit-scrollbar-track:horizontal {
        background-image: none;
        border-left: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary}33;
    }

    *::-webkit-scrollbar-thumb {
        min-height: 24px;
        border: 5px solid transparent;
        border-radius: 0;
        background-clip: content-box;
        background-color: ${(props) => props.theme.colors.primary};
        transition: box-shadow 0.2s;
    }

    *::-webkit-scrollbar-thumb:horizontal {
        min-width: 24px;
    }

    *::-webkit-scrollbar-thumb:hover {
        box-shadow: 0 0 7px ${(props) => props.theme.colors.primary}80;
    }

    *::-webkit-scrollbar-corner {
        background: transparent;
    }

    *::-webkit-scrollbar-button {
        display: none;
        width: 0;
        height: 0;
    }
    }
`;

export default GlobalScrollbar;
