import * as S from "./MapleSidebarDesign.styles";

/**
 * 사이드바 옆선 — 옅은 선 하나. 폭 조절 손잡이에 마우스를 올리면 단풍 붉음으로 짙어진다.
 * 2026-10-15 다시 그리며 먹선에 걸린 수채 가지·도장·떨어지는 씨앗을 걷었다 — 늘 흔들리는 그림이 글 옆에서 산만했다.
 */
const MapleSidebarDesign = ({ isHovered = false }: { isHovered?: boolean }) => (
    <S.Wrap $hovered={isHovered} aria-hidden data-ambient="maple-edge">
        <div className="rule" />
    </S.Wrap>
);

export default MapleSidebarDesign;
