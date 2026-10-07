/**
 * 바다의 챌린지 창 — 금빛 실선 아래 제목(Celestial), 먹선 표제(Maple) 대신
 * 16px·600 제목 밑에 머리카락 선, 칸 이름은 옅은 13px 글씨, 칸은 10px 모서리의 흰 면.
 * 단추 줄은 창 바닥에 붙여 위에 머리카락 선을 긋고 오른쪽으로 모은다 (폰에서는 반반 넓게).
 * 데스크톱에서는 오른쪽 유리 시트(OceanBaseModal) — 몸통이 시트 높이를 채우고, 단추 줄은 시트 바닥으로 내려간다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialChallengeModal.styles";
import { ink } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";
import { SHEET_TALL, field, fieldLabel, footRule, headRule, titleType } from "../../baseModal/ocean/oceanLayer";

export * from "../celestial/CelestialChallengeModal.styles";

export const ModalHeader = styled(C.ModalHeader)`
    ${titleType("1rem")}
    padding: 16px 20px 14px;
    border-bottom: none;
    ${headRule}
`;

export const ModalBody = styled(C.ModalBody)`
    padding: 16px 20px 0;
    ${MOBILE} { padding: 14px 16px 0; }
    ${SHEET_TALL} {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
`;

export const FormArea = styled(C.FormArea)`
    gap: 14px;
    /* 시트에서는 칸들이 위에 모이고(뼈대의 flex 1 은 가로 줄에서만) 남은 높이는 단추 줄 위로 */
    ${SHEET_TALL} {
        flex: 1 1 auto;
        & > .form-group, & > .form-group-row { flex: none; }
    }

    .form-group-row { gap: 12px; }

    /* 칸이 제 글자 폭보다 좁아질 수 있게 — 두 칸이 나란한 줄이 시트 밖으로 밀려 나가지 않는다 */
    .form-group {
        gap: 6px;
        min-width: 0;

        label { ${fieldLabel} }

        input, select {
            ${field}
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
            padding: 8px 10px;
            font-size: 0.875rem;
            &:hover:not(:focus) { border-color: ${(p) => ink(p.theme, 0.2)}; }
            &:focus { border-color: ${(p) => p.theme.colors.primary}; }
        }
        input[type="number"] { font-variant-numeric: tabular-nums; }
    }

    /* 단추 줄 — 창 바닥까지 펴고 위에 머리카락 선. 화면이 단추에 주는 flex 1·2 를 풀어 오른쪽으로 모은다.
       시트에서는 남은 높이를 위에 두고 바닥으로 내려간다 */
    .form-actions {
        ${footRule}
        margin: 6px -20px 0;
        padding: 12px 16px;

        & > button { flex: none !important; width: auto; min-width: 76px; height: 36px; padding: 0 14px; }

        ${MOBILE} {
            margin: 4px -16px 0;
            & > button { flex: 1 !important; min-height: 44px; }
        }
        ${SHEET_TALL} { margin-top: auto; }
    }
`;
