import * as S from './OceanAtmosphere.styles';

export default function OceanAtmosphere() {
    return <S.Shore aria-hidden="true" data-ambient="ocean">
        <svg className="tide" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none">
            <path className="wave back" d="M-300 70Q-150 20 0 70T300 70T600 70T900 70T1200 70T1500 70V140H-300Z" />
            <path className="wave front" d="M-300 88Q-150 50 0 88T300 88T600 88T900 88T1200 88T1500 88V140H-300Z" />
            <path className="foam" d="M-300 70Q-150 20 0 70T300 70T600 70T900 70T1200 70T1500 70" />
        </svg>
        <svg className="shell" viewBox="0 0 120 120" fill="none"><path d="M60 100 19 65Q5 52 18 43q-4-20 15-22 8-21 27-12 19-9 27 12 19 2 15 22 13 9-1 22Z" /><path d="M60 100 18 43m42 57L33 21m27 79V9m0 91 27-79m-27 79 42-57" /><path d="M44 100q16-12 32 0l-4 8H48Z" /></svg>
        {[0,1,2].map(i=><i key={i} className={`pearl pearl-${i}`} />)}
    </S.Shore>;
}
