import * as S from './MapleAtmosphere.styles';

const LEAF = 'M24 4l5 12 9-5-3 14 10 2-13 8 1 12-9-6-9 6 1-12-13-8 10-2-3-14 9 5Z';
export default function MapleAtmosphere() {
    return <S.Garden aria-hidden="true" data-ambient="maple">
        {Array.from({length:5},(_,i)=><span className={`fall leaf-${i}`} key={i}>
            <svg className="leaf" viewBox="0 0 48 54"><path d={LEAF} /><path className="vein" d="M24 17v36m0-24-12-7m12 13 13-9" /></svg>
        </span>)}
        <svg className="pressed" viewBox="0 0 100 100" fill="none"><path d="M10 95Q45 52 64 12M35 60l-13-25M46 44l28 5M55 28l-7-20" /><path d="M22 35Q-1 23 6 11q22-1 16 24ZM74 49q25-12 20-25-26-2-20 25ZM48 8q-21 5-15 18 17 1 15-18Z" /></svg>
        <div className="paper-light" />
    </S.Garden>;
}
