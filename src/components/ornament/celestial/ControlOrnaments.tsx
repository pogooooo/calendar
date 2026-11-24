import { Orbit, Star4, SunMoon, crescentPath } from "./CelestialOrnaments";
import { SealArt, Svg } from "./CelestialOrnaments.styles";

type Seal = "sun" | "moon" | "orbit" | "add" | "star";

/** Engravings share the artwork's paths, scaled for a control rather than a background. */
export function ControlSeal({ kind, size = 20 }: { kind: Seal; size?: number }) {
    return <SealArt aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" className="ce-seal">
        {kind === "star" ? <Star4 cx={12} cy={12} r={10} /> : <>
            <g className="seal-orbit"><Orbit cx={12} cy={12} r={10} at={52} size={1.45} /></g>
            {kind === "sun" && <SunMoon cx={12} cy={12} r={8} rays={12} />}
            {kind === "moon" && <path className="fill" d={crescentPath(12, 12, 6)} />}
            {kind === "orbit" && <><ellipse className="line" cx="12" cy="12" rx="7.5" ry="3.3" transform="rotate(-27 12 12)" /><circle className="fill" cx="12" cy="12" r="1.8" /></>}
            {kind === "add" && <path strokeWidth="1.5" d="M7 12h10m-5-5v10" />}
        </>}
    </SealArt>;
}

export function MenuCrown() {
    return <span aria-hidden="true" className="ce-crown">
        <Svg focusable="false" width="72" height="20" viewBox="0 0 72 20">
            <Star4 cx={6} cy={10} r={2.8} />
            <path className="line" d={crescentPath(18, 10, 4.4)} />
            <SunMoon cx={36} cy={10} r={8.5} rays={12} />
            <path className="line" d={crescentPath(18, 10, 4.4)} transform="translate(72) scale(-1 1)" />
            <Star4 cx={66} cy={10} r={2.8} />
        </Svg>
    </span>;
}

export function CornerStars({ four = false }: { four?: boolean }) {
    return <span aria-hidden="true" className="ce-corners">
        {(four ? ["nw", "ne", "sw", "se"] : ["nw", "se"]).map(corner =>
            <span key={corner} className={corner}><ControlSeal kind="star" size={7} /></span>
        )}
    </span>;
}
