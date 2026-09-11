import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

export const FloatingContextMenu = styled.div`
    position: fixed;
    z-index: 1100;

    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;

    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    button {
        background: none;
        border: none;
        padding: 4px 8px;
        font-size: 0.85rem;
        cursor: pointer;
        color: ${(props) => props.theme.colors.text};
        font-family: inherit;
        border-radius: 12px;
        transition: background-color 0.2s;
        /* 화면 오른쪽 끝 가까이서 열리면 fixed 요소의 폭이 남은 자리만큼 줄어들어
           "이 일정만 삭제" 가 글자 단위로 꺾였다. 줄을 못 바꾸게 하면 폭이 제 크기로
           잡히고, 위치는 useLayoutEffect 가 화면 안으로 밀어 넣는다. */
        white-space: nowrap;

        &:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }

        &.danger {
            color: ${(props) => props.theme.colors.error};
            &:hover {
                background-color: #fff1f0;
            }
        }
    }

    .divider {
        width: 1px;
        height: 14px;
        background-color: ${(props) => props.theme.colors.border};
    }

    /* 폰에서는 가로로 늘어놓으면 "이 일정만 삭제 / 전체 삭제" 가 화면을 넘고,
       글자 사이가 좁아 옆 단추를 누르게 된다. 세로로 세워 한 줄씩 짚게 한다. */
    ${MOBILE} {
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        padding: 4px;
        min-width: 170px;
        border-radius: 6px;

        button {
            min-height: 46px;
            padding: 0 14px;
            font-size: 0.9rem;
            text-align: left;
            border-radius: 4px;

            &:active { background-color: ${(props) => props.theme.colors.primary}1F; }
        }

        .divider {
            width: auto;
            height: 1px;
            align-self: stretch;
            margin: 0 8px;
        }
    }
`;