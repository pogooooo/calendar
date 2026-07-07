const Home = (props: {width: string|number|undefined}) => {
    return (
        <svg width={props.width} height={props.width} viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M15 16C15 15.2044 14.6839 14.4413 14.1213 13.8787C13.5587 13.3161 12.7957 13 12 13C11.2044 13 10.4413 13.3161 9.87868 13.8787C9.31607 14.4413 9 15.2043 9 16V20H4L4 10L8 6.5M12 3L20 10L20 20H15"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

export default Home
