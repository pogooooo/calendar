import * as S from "./MapleSidebarDesign.styles";

/** 사이드바 옆선 — 먹선에 걸린 단풍 가지. 마우스를 올리면 바람이 분다. */
const MapleSidebarDesign = ({ isHovered = false }: { isHovered?: boolean }) => (
    <S.Wrap $hovered={isHovered} aria-hidden data-ambient="maple-branch">
        <div className="rule" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="branch" src="/themes/maple/sidebar-branch.webp" alt="" draggable={false} />
        <div className="seal" />
        {[0,1,2].map(i=><span key={i} className={`seed seed-${i}`} />)}
    </S.Wrap>
);

export default MapleSidebarDesign;
