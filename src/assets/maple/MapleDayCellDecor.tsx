import * as S from "./MapleDayCellDecor.styles";

/**
 * 달력 칸의 챌린지 단계(tier 1~3) — 칸 왼쪽 위의 작은 단풍잎이 노랑 → 호박빛 → 붉음으로 물든다.
 * 잎은 칸마다 따로라 옆 칸과 잇지 않는다(connectLeft·connectRight 는 받기만 한다).
 */
const MapleDayCellDecor = ({
    tier,
}: {
    tier: number;
    connectLeft?: boolean;
    connectRight?: boolean;
}) => {
    if (tier < 1) return null;
    return <S.Leaf className="cell-decor" $level={tier} aria-hidden="true" />;
};

export default MapleDayCellDecor;
