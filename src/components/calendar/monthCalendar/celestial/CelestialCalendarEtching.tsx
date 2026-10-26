import { Star4, Star8, SunMoon } from '@/components/ornament/celestial/CelestialOrnaments';
import * as S from './CelestialCalendarEtching.styles';

/** An engraved astronomical plate sits behind the dates, never above their text. */
export default function CelestialCalendarEtching({ month }: { month:Date }) {
    return <S.Etching aria-hidden="true" data-calendar-etching="celestial">
        <svg viewBox="0 0 480 480" width="480" height="480" preserveAspectRatio="xMidYMid meet" className="solar-seal">
            <circle className="hair" cx="240" cy="240" r="224" />
            <circle className="hair" cx="240" cy="240" r="216" />
            <SunMoon cx={240} cy={240} r={190} rays={48} />
            <Star8 cx={240} cy={31} r={9} /><Star4 cx={31} cy={240} r={6} />
            <Star4 cx={449} cy={240} r={6} /><Star8 cx={240} cy={449} r={9} />
        </svg>
        <div className="plate-index"><span>CELESTIAL</span><span>{['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][month.getMonth()]}</span></div>
    </S.Etching>;
}
