interface TwinkleProps {
    width: number,
    height: number,
    stroke: string
}

const Twinkle = ({width, height, stroke} : TwinkleProps) => {
    return (
        <svg width={width} height={height} viewBox="0 0 16 51" fill="none"
             xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path
                d="M7.88379 0.384003C7.88379 25.384 7.88379 25.384 15.3838 25.384C7.88379 25.384 7.88379 25.384 7.88379 50.384C7.88379 25.384 7.88379 25.384 0.383789 25.384C7.88379 25.384 7.88379 25.384 7.88379 0.384003Z"
                stroke={stroke} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

export default Twinkle