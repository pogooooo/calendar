/**
 * WidgetPreview 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled from "styled-components";

export const Frame = styled.svg`
    width: 100%;
    height: 62px;
    flex-shrink: 0;
    color: ${(props) => props.theme.colors.primary};
    border: 1px solid ${(props) => props.theme.colors.primary}55;

    .ln { stroke: currentColor; fill: none; stroke-width: 1; vector-effect: non-scaling-stroke; }
    .dim { opacity: 0.4; }
    .fill { fill: currentColor; stroke: none; }
    .fill-dim { fill: currentColor; stroke: none; opacity: 0.35; }
`;
