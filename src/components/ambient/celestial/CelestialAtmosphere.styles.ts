import styled from 'styled-components';
import { ornamentStrokes } from '@/components/ornament/celestial/CelestialOrnaments.styles';

/**
 * Celestial 의 바탕 모양 — 고정된 한 겹(z-index 0, 누르는 것은 받지 않는다). 글 뒤라 옅게:
 * 오른쪽 위 천체 궤도 .14, 아래 해와 달 .06, 가장자리 금선과 문양 .3, 별하늘(캔버스)의 별 .14~.72.
 * 폰에서는 궤도를 줄이고 가장자리 금선을 걷는다(내용이 화면 끝까지 온다).
 */
export const Sky = styled.div`
    position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden;
    color:${p=>p.theme.colors.primary};

    svg { ${ornamentStrokes} position:absolute; overflow:visible; }
    /* 별하늘(celestialSky) — 가장 뒤에. 반짝임·손 반응은 캔버스가 그린다 */
    .stars { position:absolute; inset:0; width:100%; height:100%; }
    /* 큰 궤도·해와 달은 커서(폰은 기울기)를 따라 조금 비켜 깊이가 보인다 — 별하늘이 --sky-px·--sky-py 를 적는다 */
    .orrery { right:-300px; top:-300px; width:640px; height:640px; opacity:.14; translate:calc(var(--sky-px, 0) * -16px) calc(var(--sky-py, 0) * -11px); }
    .orrery .o1 { --orbit: 240s; } .orrery .o2 { --orbit: 160s; }
    .halo { left:34%; bottom:-170px; width:320px; height:320px; opacity:.06; translate:calc(var(--sky-px, 0) * 9px) calc(var(--sky-py, 0) * 6px); }

    .rail { position:absolute; right:22px; top:0; bottom:0; width:1px; background:currentColor; opacity:.22; }
    /* 곁줄은 화면 가운데 토막만, 양 끝에 점 */
    .rail.side { right:30px; top:30%; bottom:30%; opacity:.14; }
    .rail.side::before, .rail.side::after { content:""; position:absolute; left:-1.5px; width:4px; height:4px; border-radius:50%; background:currentColor; }
    .rail.side::before { top:-2px; } .rail.side::after { bottom:-2px; }
    .bead { right:3px; width:40px; height:40px; margin-top:-20px; opacity:.4; }
    .bead.dot, .bead.loop { opacity:.5; }

    @media(max-width:768px) {
        .orrery { width:380px; height:380px; right:-200px; top:-190px; opacity:.1; }
        .halo, .rail, .bead { display:none; }
    }
    @media(max-width:500px) and (max-height:350px) { display:none; }
    /* 기기의 동작 줄이기는 data-theme-motion 이 담는다 — 설정에서 '그래도 움직이기'를 켰으면 움직인다 */
    html[data-theme-motion="off"] & * { animation:none; }
`;
