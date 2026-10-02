import Seashell from '@/assets/ocean/Seashell';
import * as S from './OceanSidebarDesign.styles';
export default function OceanSidebarDesign({isHovered=false}: {isHovered?:boolean}) {
    return <S.Coast $hovered={isHovered} aria-hidden="true" data-ambient="ocean-coast">
        <svg viewBox="0 0 160 954" fill="none"><path className="shore" d="M100 0q20 80 0 160t0 160t0 160t0 160t0 160t0 160" /><path className="foam" d="M105 0q20 80 0 160t0 160t0 160t0 160t0 160t0 160" />
            {[320,470,680,800].map((y,i)=><circle key={y} className="pearl" cx={96+i%2*12} cy={y} r={i%2?2:3} style={{animationDelay:`-${i*2}s`}} />)}</svg><Seashell className="shell" />
    </S.Coast>;
}
