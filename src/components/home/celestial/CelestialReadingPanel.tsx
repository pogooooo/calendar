import type { ReactNode } from 'react';
import { MoonDisc, Star4, crescentPath } from '@/components/ornament/celestial/CelestialOrnaments';
import { Frame, LunarDivider } from './CelestialReadingPanel.styles';

export default function CelestialReadingPanel({ children }: { children: ReactNode }) {
    return <Frame data-home-reading-panel="">
        {children}
        <LunarDivider viewBox="0 0 320 72" data-home-lunar-divider="" aria-hidden="true" focusable="false">
            <path d="M14 36h35m34 0h13m30 0h13m42 0h13m30 0h13m34 0h35" />
            <Star4 cx={22} cy={36} r={6} />
            <Star4 cx={298} cy={36} r={6} />
            <path className="fill" d={crescentPath(68, 36, 11)} />
            <path className="fill" transform="translate(320 0) scale(-1 1)" d={crescentPath(68, 36, 11)} />
            <MoonDisc cx={111} cy={36} r={10.5} phase={.75} />
            <MoonDisc cx={209} cy={36} r={10.5} phase={.25} />
            <circle cx="160" cy="36" r="15" />
            <MoonDisc cx={160} cy={36} r={10.5} phase={.5} ring={false} />
            <path d="M144 20a23 23 0 0 1 32 0m-32 32a23 23 0 0 0 32 0" opacity=".7" />
            <Star4 cx={160} cy={11} r={4} />
            <Star4 cx={160} cy={61} r={4} />
        </LunarDivider>
    </Frame>;
}
