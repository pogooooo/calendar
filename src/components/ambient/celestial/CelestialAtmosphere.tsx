import * as S from './CelestialAtmosphere.styles';

export default function CelestialAtmosphere() {
    return <S.Sky aria-hidden="true" data-ambient="celestial">
        <svg className="chart" viewBox="0 0 320 320" fill="none">
            <g className="wheel"><circle cx="160" cy="160" r="136" /><circle cx="160" cy="160" r="128" />
                {Array.from({length:24},(_,i)=><path key={i} d="M160 24v7" transform={`rotate(${i*15} 160 160)`} />)}
            </g>
            <g className="constellation"><path d="M72 174l49-82 46 38 53-57 35 109-74 54-109-62" />
                {[[72,174],[121,92],[167,130],[220,73],[255,182],[181,236]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2" />)}
            </g>
            <path className="moon" d="M165 139a24 24 0 1 0 17 40 26 26 0 0 1-17-40Z" />
        </svg>
        {Array.from({length:26},(_,i)=><i key={i} className="glint" style={{left:`${(i*37+9)%100}%`,top:`${(i*53+7)%100}%`,animationDelay:`-${i%8}s`,animationDuration:`${5+i%5}s`}} />)}
        {[0,1].map(i=><span key={i} className={`comet comet-${i}`} />)}
    </S.Sky>;
}
