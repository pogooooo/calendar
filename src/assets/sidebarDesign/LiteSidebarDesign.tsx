const LiteSidebarDesign = () => {
    return (
        <svg width="160" height="954" viewBox="0 0 160 954" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 수직 중심선 */}
            <path d="M102 0 L102 110" stroke="#C9B59C" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
            <path d="M102 370 L102 954" stroke="#C9B59C" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>

            {/* 상단 잎사귀 장식 */}
            <path d="M102 118 C102 118 90 130 90 145 C90 158 102 162 102 162 C102 162 114 158 114 145 C114 130 102 118 102 118Z"
                stroke="#C9B59C" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
            <path d="M102 118 L102 162" stroke="#C9B59C" strokeWidth="0.6" strokeLinecap="round" opacity="0.5"/>
            <path d="M102 131 C98 134 94 138 93 143" stroke="#C9B59C" strokeWidth="0.5" strokeLinecap="round" opacity="0.4"/>
            <path d="M102 131 C106 134 110 138 111 143" stroke="#C9B59C" strokeWidth="0.5" strokeLinecap="round" opacity="0.4"/>
            <path d="M102 144 C99 146 95 148 93 152" stroke="#C9B59C" strokeWidth="0.5" strokeLinecap="round" opacity="0.4"/>
            <path d="M102 144 C105 146 109 148 111 152" stroke="#C9B59C" strokeWidth="0.5" strokeLinecap="round" opacity="0.4"/>

            {/* 중간 원형 장식 + 선 */}
            <circle cx="102" cy="230" r="28" stroke="#C9B59C" strokeWidth="0.8" opacity="0.5"/>
            <circle cx="102" cy="230" r="18" stroke="#C9B59C" strokeWidth="0.5" opacity="0.35"/>
            <circle cx="102" cy="230" r="4" stroke="#C9B59C" strokeWidth="0.8" opacity="0.6"/>

            {/* 원 주변 방사선 */}
            <path d="M102 196 L102 205" stroke="#C9B59C" strokeWidth="0.7" strokeLinecap="round" opacity="0.4"/>
            <path d="M102 255 L102 264" stroke="#C9B59C" strokeWidth="0.7" strokeLinecap="round" opacity="0.4"/>
            <path d="M68 230 L77 230" stroke="#C9B59C" strokeWidth="0.7" strokeLinecap="round" opacity="0.4"/>
            <path d="M127 230 L159 230" stroke="#C9B59C" strokeWidth="0.7" strokeLinecap="round" opacity="0.4"/>
            <path d="M0 230 L74 230" stroke="#C9B59C" strokeWidth="0.7" strokeLinecap="round" opacity="0.3"/>

            {/* 대각선 포인트 */}
            <path d="M79 207 L85 213" stroke="#C9B59C" strokeWidth="0.6" strokeLinecap="round" opacity="0.35"/>
            <path d="M119 207 L113 213" stroke="#C9B59C" strokeWidth="0.6" strokeLinecap="round" opacity="0.35"/>
            <path d="M79 253 L85 247" stroke="#C9B59C" strokeWidth="0.6" strokeLinecap="round" opacity="0.35"/>
            <path d="M119 253 L113 247" stroke="#C9B59C" strokeWidth="0.6" strokeLinecap="round" opacity="0.35"/>

            {/* 원 연결 수직선 */}
            <path d="M102 168 L102 200" stroke="#C9B59C" strokeWidth="0.6" strokeLinecap="round" opacity="0.4"/>
            <path d="M102 260 L102 290" stroke="#C9B59C" strokeWidth="0.6" strokeLinecap="round" opacity="0.4"/>

            {/* 하단 잎사귀 */}
            <path d="M102 298 C86 310 80 328 84 345 C88 360 102 366 102 366 C102 366 116 360 120 345 C124 328 118 310 102 298Z"
                stroke="#C9B59C" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
            <path d="M102 298 L102 366" stroke="#C9B59C" strokeWidth="0.6" strokeLinecap="round" opacity="0.4"/>
            <path d="M102 312 C97 318 90 326 87 334" stroke="#C9B59C" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <path d="M102 312 C107 318 114 326 117 334" stroke="#C9B59C" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <path d="M102 330 C97 336 92 342 89 350" stroke="#C9B59C" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>
            <path d="M102 330 C107 336 112 342 115 350" stroke="#C9B59C" strokeWidth="0.5" strokeLinecap="round" opacity="0.35"/>

            {/* 작은 점 장식 */}
            <circle cx="92" cy="200" r="1.5" stroke="#C9B59C" strokeWidth="0.6" opacity="0.5"/>
            <circle cx="112" cy="200" r="1.5" stroke="#C9B59C" strokeWidth="0.6" opacity="0.5"/>
            <circle cx="92" cy="260" r="1.5" stroke="#C9B59C" strokeWidth="0.6" opacity="0.5"/>
            <circle cx="112" cy="260" r="1.5" stroke="#C9B59C" strokeWidth="0.6" opacity="0.5"/>
            <circle cx="75" cy="230" r="1.2" stroke="#C9B59C" strokeWidth="0.5" opacity="0.4"/>
            <circle cx="129" cy="230" r="1.2" stroke="#C9B59C" strokeWidth="0.5" opacity="0.4"/>

            {/* 수평 장식선 */}
            <path d="M60 175 L144 175" stroke="#C9B59C" strokeWidth="0.5" strokeLinecap="round" opacity="0.25"/>
            <path d="M60 285 L144 285" stroke="#C9B59C" strokeWidth="0.5" strokeLinecap="round" opacity="0.25"/>
        </svg>
    );
};

export default LiteSidebarDesign;
