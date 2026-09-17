import * as S from "./MapleDayCellDecor.styles";

/** 달력 칸의 바쁜 정도(tier 1~3). 같은 단계가 이어지면 물이 옆 칸으로 이어진다 */
const MapleDayCellDecor = ({
    tier,
    connectLeft = false,
    connectRight = false,
}: {
    tier: number;
    connectLeft?: boolean;
    connectRight?: boolean;
}) => {
    if (tier < 1) return null;
    return <S.Wash className="cell-decor" $level={tier} $left={connectLeft} $right={connectRight} aria-hidden="true" />;
};

export default MapleDayCellDecor;
