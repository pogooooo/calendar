import type { DayCellDecorProps } from '../DayCellDecor';
import * as S from './DayCellDecor.styles';
export default function OceanDayCellDecor({tier,connectLeft,connectRight}: DayCellDecorProps) {
    if (tier < 1) return null;
    return <S.Tide className="cell-decor" $tier={tier} $left={connectLeft} $right={connectRight} aria-hidden="true"><svg viewBox="0 0 120 28" preserveAspectRatio="none"><path d="M0 12q15-8 30 0t30 0t30 0t30 0v16H0Z" /></svg></S.Tide>;
}
