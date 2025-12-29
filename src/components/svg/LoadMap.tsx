const LoadMap = (props: {width: string|number|undefined}) => {
    return (
        <svg width={props.width} height={props.width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC"
               strokeWidth="1"></g>
            <g id="SVGRepo_iconCarrier">
                <path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="#000000"
                      strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
            </g>
        </svg>
    )
}

export default LoadMap
