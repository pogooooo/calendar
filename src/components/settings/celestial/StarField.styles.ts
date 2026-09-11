/**
 * StarField 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled from "styled-components";

/**
 * 설정 화면 바탕의 옅은 별 필드.
 *
 * 로그인 화면에는 별자리 그림이 깔려 있는데 설정만 빈 면이라 같은 앱으로
 * 보이지 않았다. 글자 읽기를 방해하지 않을 만큼만 뿌린다.
 * 점이 수백 개라 SVG 로 그리면 노드가 그만큼 늘어난다. 캔버스로 그린다.
 */
/**
 * 화면에 고정한다.
 *
 * 설정은 문서 전체가 굴러가므로(스크롤바를 하나로 모으면서 그렇게 됐다)
 * 문서 높이만큼 캔버스를 만들면 수천 픽셀짜리가 되어 메모리를 크게 먹는다.
 * 뷰포트만 덮고 그 자리에 머물면 화면상 결과는 같으면서 값이 싸다.
 */
export const Canvas = styled.canvas`
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    pointer-events: none;
`;
