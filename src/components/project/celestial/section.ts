import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

/**
 * 프로젝트 화면의 큰 칸(보드·타임라인)을 감싸는 틀.
 *
 * 예전에는 보드 파일과 타임라인 파일에 똑같은 것이 각각 있었다. 생김새가 같으니
 * 한쪽만 고치면 조용히 어긋난다 — 폰 대응 때 실제로 같은 수정을 두 번 했다.
 * 폰에서는 내용 높이로 펼쳐 바깥 페이지 하나가 스크롤을 맡는다.
 */
export const SectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 150px;
    overflow: hidden;
    border: none;
    background: transparent;

    /* 비율은 인라인 style 로 들어오므로 !important 로만 덮인다. */
    ${MOBILE} {
        flex: none !important;
        height: auto;
        min-height: 0;
        overflow: visible;
    }
`;

export const SectionTitle = styled.div`
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 0.9rem;
    letter-spacing: 0.06em;
    color: ${(props) => props.theme.colors.textSecondary};
    padding: 8px 12px;
    border-bottom: none;

    ${MOBILE} { padding: 10px 12px; }
`;
