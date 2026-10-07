"use client";
/**
 * Celestial 사이드바 옆선 — 별이 박힌 금빛 세로선, 그 한가운데에 혼천의(3D 오브제).
 * 세로선이 곧 혼천의의 극축이다: 위 꼭지와 아래 꼭지에서 선이 이어진다.
 * 옆선에 커서를 올리면 천구가 빨리 돌고, 혼천의를 가로로 끌면 돌아간다(그 자리에서는 폭 조절 대신 돌리기).
 * WebGL 이 없으면 예전 그림(초승달과 궤도)이 같은 자리에 선다.
 */
import Objet from "@/components/objet/Objet";
import * as S from "./CelestialSidebarDesign.styles";

/** 혼천의 자리 — 그림 좌표(=CSS px)에서 세로선 x 와 중심 높이 */
const AXIS_X = 102.384;
const EMBLEM_Y = 232;
const EMBLEM = 128;

/** WebGL 이 없을 때 — 예전 초승달·궤도 그림을 혼천의 칸에 맞춰 잘라 보인다 */
const OldEmblem = () => (
    <S.OldEmblem viewBox={`${AXIS_X - EMBLEM / 2} ${EMBLEM_Y - EMBLEM / 2} ${EMBLEM} ${EMBLEM}`} fill="none" aria-hidden="true">
        <path className="moon" d="M124.384 243.14C122.434 247.212 119.427 250.686 115.678 253.2C111.928 255.714 107.573 257.177 103.066 257.435C98.559 257.693 94.0652 256.738 90.053 254.668C86.0408 252.599 82.6571 249.491 80.2546 245.669C77.8522 241.847 76.5189 237.45 76.3937 232.938C76.2686 228.425 77.3562 223.961 79.5431 220.012C81.73 216.063 84.9363 212.772 88.8276 210.484C92.7189 208.195 97.1529 206.992 101.667 207C103.94 206.995 106.202 207.302 108.391 207.913C103.955 209.319 100.169 212.266 97.7162 216.221C95.2633 220.175 94.3055 224.877 95.016 229.476C95.7264 234.075 98.0582 238.268 101.59 241.298C105.122 244.328 109.621 245.995 114.274 245.998C117.844 246.003 121.345 245.014 124.384 243.14Z" stroke="currentColor" strokeMiterlimit="10" />
        <path d="M62.8964 213C44.396 263 103.896 288 126.896 248" stroke="currentColor" />
        <path d="M85.5856 226.264C100.47 219.702 114.627 215.354 125.478 213.621C130.907 212.753 135.479 212.546 138.889 213.028C142.331 213.515 144.426 214.677 145.179 216.385C145.932 218.092 145.376 220.423 143.414 223.292C141.47 226.135 138.232 229.37 133.93 232.793C125.332 239.634 112.572 247.153 97.6875 253.715C82.8035 260.276 68.6456 264.625 57.7954 266.358C52.3665 267.225 47.7943 267.432 44.384 266.95C40.9424 266.464 38.847 265.302 38.0942 263.594C37.3414 261.886 37.897 259.556 39.8592 256.687C41.8036 253.844 45.0408 250.608 49.343 247.185C57.9413 240.344 70.7015 232.826 85.5856 226.264Z" stroke="currentColor" />
        <circle className="satellite" r="1.8" fill="currentColor" />
        <path d="M102.384 164V207M102.384 258V300" stroke="currentColor" strokeLinecap="round" />
    </S.OldEmblem>
);

const CelestialSidebarDesign = ({ isHovered = false }: { isHovered?: boolean }) => (
    <S.Frame>
        <S.AnimatedSvg aria-hidden="true" data-ambient="celestial-sidebar" $hovered={isHovered} width="160" height="954" viewBox="0 0 160 954" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 위: 선 → 작은 별 → 혼천의 위 꼭지까지 */}
            <path d="M102.384 0V106" stroke="currentColor" strokeLinecap="round" />
            <path className="orn spark"
                d="M102.384 115.625C102.384 118.317 103.727 120.5 105.384 120.5C103.727 120.5 102.384 122.683 102.384 125.375C102.384 122.683 101.041 120.5 99.384 120.5C101.041 120.5 102.384 118.317 102.384 115.625Z"
                stroke="currentColor" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M102.384 133V166" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />

            {/* 혼천의 둘레의 잔별 */}
            <path className="orn dotstar d5" d="M47.384 186C47.384 185.667 47.584 185 48.384 185C49.184 185 49.384 185.667 49.384 186C49.384 186.333 49.184 187 48.384 187C47.584 187 47.384 186.333 47.384 186Z" stroke="currentColor" />
            <path className="orn dotstar d6" d="M40.384 262C40.384 261.667 40.584 261 41.384 261C42.184 261 42.384 261.667 42.384 262C42.384 262.333 42.184 263 41.384 263C40.584 263 40.384 262.333 40.384 262Z" stroke="currentColor" />
            <path className="orn dotstar d3" d="M150.384 204.5C150.384 204.167 150.584 203.5 151.384 203.5C152.184 203.5 152.384 204.167 152.384 204.5C152.384 204.833 152.184 205.5 151.384 205.5C150.584 205.5 150.384 204.833 150.384 204.5Z" stroke="currentColor" />
            <path className="orn spark s-b"
                d="M146.384 274.375C146.384 278.31 148.063 281.5 150.134 281.5C148.063 281.5 146.384 284.69 146.384 288.625C146.384 284.69 144.705 281.5 142.634 281.5C144.705 281.5 146.384 278.31 146.384 274.375Z"
                stroke="currentColor" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round" />

            {/* 아래: 혼천의 아래 꼭지 → 큰 별 → 끝까지 */}
            <path d="M102.384 294V318" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
            <g transform="translate(0 12)">
                <path className="orn bigstar b-b"
                    d="M102.384 312.375C102.384 343.5 102.384 343.5 109.884 343.5C102.384 343.5 102.384 343.5 102.384 374.625C102.384 343.5 102.384 343.5 94.884 343.5C102.384 343.5 102.384 343.5 102.384 312.375Z"
                    stroke="currentColor" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <path d="M102.384 395V954" stroke="currentColor" strokeLinecap="round" />

            <circle className="mini" cx="96" cy="58" r="0.9" fill="currentColor" />
            <circle className="mini m2" cx="110" cy="84" r="0.7" fill="currentColor" />
            <circle className="mini m3" cx="95" cy="418" r="0.8" fill="currentColor" />
            <circle className="mini m4" cx="108" cy="460" r="1" fill="currentColor" />
            <circle className="mini m5" cx="97" cy="522" r="0.7" fill="currentColor" />
            <circle className="mini m6" cx="109" cy="604" r="0.9" fill="currentColor" />
            <circle className="mini m7" cx="95" cy="694" r="0.8" fill="currentColor" />
            <circle className="mini m8" cx="107" cy="782" r="0.7" fill="currentColor" />
            <circle className="mini m9" cx="98" cy="872" r="0.9" fill="currentColor" />
            <circle className="bead" r="1" fill="currentColor" />
            <circle className="bead-top" r="1" fill="currentColor" />
        </S.AnimatedSvg>

        <S.Emblem style={{ left: AXIS_X - EMBLEM / 2, top: EMBLEM_Y - EMBLEM / 2, width: EMBLEM, height: EMBLEM }}>
            <Objet name="celestial/armillary" size={EMBLEM} active={isHovered} fallback={<OldEmblem />} />
        </S.Emblem>
    </S.Frame>
);

export default CelestialSidebarDesign;
