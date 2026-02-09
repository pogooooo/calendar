import {useTheme} from "styled-components";

interface ArrowProps {
    width: number,
    height: number,
    stroke: string,
    isRight: boolean
}

const Arrow = ({width, height, stroke, isRight} : ArrowProps) => {
    const theme = useTheme()
    const strokeColor = stroke || theme.colors.primary;

    return (
        <svg width={width} height={height} viewBox="0 0 75 16" fill="none"
             xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
             style={{transform: isRight ? 'scaleX(-1)' : 'none'}}>
            <path
                d="M67.1338 0.384003C67.1338 7.384 39.1338 7.384 0.383789 7.384C39.1338 7.384 67.1338 7.384 67.1338 14.634C67.1338 10.6989 71.8127 7.384 73.8838 7.384C71.8127 7.384 67.1338 4.31903 67.1338 0.384003Z"
                stroke={strokeColor}
                strokeWidth="0.7"/>
        </svg>
    )
}

export default Arrow