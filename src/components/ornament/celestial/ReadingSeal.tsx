import { Star4 } from "./CelestialOrnaments";

export default function ReadingSeal() {
    return <svg viewBox="0 0 96 96" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth=".8">
        <circle cx="48" cy="48" r="41" />
        <circle cx="48" cy="48" r="37" strokeDasharray="1 2" />
        <circle cx="48" cy="48" r="30" />
        <path d="M48 4v18m0 52v18M4 48h18m52 0h18M48 24q3 21 24 24-21 3-24 24-3-21-24-24 21-3 24-24ZM17 17l9 9m44 44 9 9m0-62-9 9M26 70l-9 9" />
        <g fill="currentColor" stroke="none"><Star4 cx={11} cy={48} r={5} /><Star4 cx={85} cy={48} r={5} /></g>
    </svg>;
}
