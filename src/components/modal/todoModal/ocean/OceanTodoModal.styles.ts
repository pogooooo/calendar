/**
 * 바다의 할 일 창 — 금빛 실선으로 나눈 서식(Celestial), 먹선 종이 서식(Maple) 대신 **선 없는 속성 목록**:
 *   제목은 16px·600 한 줄, 그 밑과 단추 줄 위에만 머리카락 선. 닫기는 28px 글자 단추
 *   한 줄 = 옅은 이름(아이콘 포함) + 오른쪽 칸. 칸은 10px 모서리의 흰 면에 선 하나, 누르면 청록 선과 옅은 고리
 *   반복 조건은 판 안의 작은 카드(surface "card"), 스위치는 36×20 납작한 홈, 단추는 오른쪽 정렬
 *
 * 데스크톱에서는 오른쪽 유리 시트(OceanBaseModal) — 서식이 시트 높이를 다 채워 머리는 위, 몸통은 남은 높이에서 굴러가고,
 * 단추 줄은 시트 바닥에 놓인다.
 * 키 작은 창(위젯·눕힌 폰·자판이 올라온 폰·낮은 데스크톱 창)에서 머리·몸통·바닥을 한 덩어리로 굴리는 뼈대(Celestial 의
 * max-height: 520px — 서식이 굴러가고, 몸통은 넘쳐도 그대로 두고, 바닥은 붙는다)는 건드리지 않는다.
 * 바닥의 position 은 덮어쓰지 않고, 붙은 바닥 뒤가 비치지 않게 바닥에 판(시트)과 같은 색을 깐다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialTodoModal.styles";
import { hairline, ink, surface } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";
import { SHEET_TALL, field, fieldLabel, footRule, ghostIcon, headRule, menuRow, sheetFill, sheetFootBg, switch36, titleType } from "../../baseModal/ocean/oceanLayer";

export * from "../celestial/CelestialTodoModal.styles";

/** 서식 — 시트 높이를 다 채운다 */
export const FormWrapper = styled(C.FormWrapper)`
    ${sheetFill}
`;

/** 칸 바탕 — 손이 가도 흰 면 그대로 (뼈대가 거는 금빛 물을 지운다) */
const fieldBg = (p: { theme: { mode: string } }) => (p.theme.mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.9)");

export const Header = styled(C.Header)`
    padding: 14px 12px 12px 20px;
    background: transparent;
    border-radius: 0;
    ${headRule}

    .title-input {
        ${titleType("1rem")}
        margin-right: 8px;
        padding: 4px 0;
        border-bottom: none;
        caret-color: ${(p) => p.theme.colors.primary};
        &::placeholder { color: ${(p) => p.theme.colors.textSecondary}; opacity: 0.7; }
        &:focus { border-bottom: none; }
    }

    .close-btn {
        ${ghostIcon("28px")}
        ${MOBILE} { width: 44px; height: 44px; }
    }

    ${MOBILE} { padding: 10px 6px 10px 16px; }
`;

/* 화면이 맨 위 카테고리 칸에 양옆 8px 를 인라인으로 주므로, 줄들도 8px 안쪽에서 시작해 한 줄로 맞춘다 */
export const ScrollBody = styled(C.ScrollBody)`
    gap: 2px;
    padding: 12px 12px 16px;
    background: transparent;

    ${MOBILE} { padding: 10px 8px 14px; }
    ${SHEET_TALL} { flex: 1 1 auto; min-height: 0; }
`;

/** 한 줄 — 상자 없이 이름 + 칸 */
export const FieldRow = styled(C.FieldRow)`
    min-height: 40px;
    padding: 4px 8px;
    border-bottom: none;

    label { ${fieldLabel} min-width: 96px; }

    input[type="text"], input[type="date"], input[type="datetime-local"] {
        ${field}
        padding: 7px 10px;
        text-align: left;
        cursor: text;
        &:hover, &:focus { background-color: ${fieldBg}; }
    }

    ${MOBILE} {
        gap: 6px;
        label { min-width: 76px; }
    }
`;

/** 반복 — "N 일마다" 작은 숫자 칸, 켜면 아래로 조건 카드 */
export const RepeatRow = styled(C.RepeatRow)`
    gap: 8px;
    padding: 4px 8px;
    border-bottom: none;

    label { ${fieldLabel} }

    .repeat-header .repeat-input-group {
        gap: 8px;

        input[type="number"] {
            ${field}
            width: 56px;
            height: 32px;
            padding: 0 6px;
            font-weight: 600;
            font-variant-numeric: tabular-nums;
            color: ${(p) => p.theme.colors.text};
            &:hover, &:focus { background-color: ${fieldBg}; border-bottom: 1px solid ${(p) => ink(p.theme, 0.2)}; }
            &:focus { border-color: ${(p) => p.theme.colors.primary}; }
        }

        span { font-size: 0.8125rem; color: ${(p) => p.theme.colors.textSecondary}; }
    }
`;

/** 반복 조건 — 판 안의 작은 카드 */
export const RepeatConditionBox = styled(C.RepeatConditionBox)`
    ${surface("card")}
    gap: 8px;
    padding: 12px;
    border-radius: 12px;

    .condition-title { font-size: 0.75rem; font-weight: 600; color: ${(p) => p.theme.colors.textSecondary}; }

    input[type="date"], input[type="number"] {
        ${field}
        padding: 8px 10px;
        font-variant-numeric: tabular-nums;
        &:hover, &:focus { background-color: ${fieldBg}; }
        &:focus { border-color: ${(p) => p.theme.colors.primary}; }
    }

    .count-input-group span { font-size: 0.8125rem; }
`;

export const MemoRow = styled(C.MemoRow)`
    gap: 6px;
    padding: 8px 8px 0;

    label { ${fieldLabel} }

    textarea {
        ${field}
        min-height: 84px;
        padding: 9px 10px;
        &:focus { background-color: ${fieldBg}; }
    }
`;

/* 옛 고르기 조각 — 지금 창은 Select 를 쓰지만 이름은 남아 있다. 남는 동안에도 같은 결로 */
export const DropdownHeader = styled(C.DropdownHeader)`
    ${field}
    padding: 8px 10px;
    &:hover { border-color: ${(p) => ink(p.theme, 0.2)}; }
`;

export const DropdownList = styled(C.DropdownList)`
    ${surface("float")}
    position: absolute;
    padding: 4px;
    border-radius: 12px;
`;

export const DropdownItem = styled(C.DropdownItem)`
    ${menuRow}
    border-bottom: none;
`;

export const ColorDot = styled(C.ColorDot)`
    width: 8px;
    height: 8px;
    box-shadow: none;
`;

export const ToggleSwitch = styled(C.ToggleSwitch)`${switch36}`;

/** 바닥 — 위에 머리카락 선, 단추는 오른쪽. 붙은 바닥(키 작은 창)에서 뒤가 비치지 않게 판과 같은 색 */
export const Footer = styled(C.Footer)`
    ${footRule}
    padding: 12px 16px;
    background-color: ${(p) => p.theme.colors.surface};
    ${sheetFootBg}

    ${MOBILE} { padding: 10px 16px; }

    /* 붙은 바닥은 위 칸과 겹쳐 보이므로 선을 조금 더 */
    @media (max-height: 520px) { border-top-color: ${(p) => hairline(p.theme, true)}; }
`;
