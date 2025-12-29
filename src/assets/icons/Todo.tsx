const Todo = (props: {width: string|number|undefined}) => {
    return (
        <svg width={props.width} height={props.width} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
             viewBox="0 0 32 32" enableBackground="new 0 0 32 32" xmlSpace="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier"> <line fill="none" stroke="#000000" strokeWidth="0.8320000000000001"
                                               strokeMiterlimit="10" x1="15" y1="16" x2="28" y2="16"></line>
                <polyline fill="none" stroke="#000000" strokeWidth="1" strokeMiterlimit="10"
                          points="5,16 7,18 11,14 "></polyline>
                <line fill="none" stroke="#000000" strokeWidth="1" strokeMiterlimit="10" x1="15"
                      y1="8" x2="28" y2="8"></line>
                <polyline fill="none" stroke="#000000" strokeWidth="1" strokeMiterlimit="10"
                          points="5,8 7,10 11,6 "></polyline>
                <line fill="none" stroke="#000000" strokeWidth="1" strokeMiterlimit="10" x1="15"
                      y1="24" x2="28" y2="24"></line>
                <polyline fill="none" stroke="#000000" strokeWidth="1" strokeMiterlimit="10"
                          points="5,24 7,26 11,22 "></polyline> </g></svg>
    )
}

export default Todo
