import type { DayCellDecorProps } from '../DayCellDecor';
import * as S from './DayCellDecor.styles';

/**
 * 바다의 달력 칸 꾸밈 — 그날 챌린지를 해낸 정도(1~3)를 칸 아래 가는 청록 선 하나로.
 * 많이 해낼수록 선이 짙어지고, 같은 단계가 옆 칸으로 이어지면 선도 칸 끝까지 닿는다. 움직이지 않는다.
 * (Celestial: 금빛 틀, Maple: 황토 물)
 */
export default function OceanDayCellDecor({ tier, connectLeft = false, connectRight = false }: DayCellDecorProps) {
    if (tier < 1) return null;
    return <S.Line className="cell-decor" $tier={tier} $left={connectLeft} $right={connectRight} aria-hidden="true" />;
}
