import { useId } from 'react';

/** Cut geometry keeps its proportions at every size. All color comes from currentColor. */
export function FacetedGem({ cx = 0, cy = 0, r = 30, className }: { cx?: number; cy?: number; r?: number; className?: string }) {
    const id = useId().replace(/:/g, '');
    return <g className={className} transform={`translate(${cx} ${cy}) scale(${r / 30})`}>
        <defs>
            <linearGradient id={`${id}-cut`} x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="currentColor" offset="0" /><stop stopColor="currentColor" stopOpacity=".45" offset=".43" /><stop stopColor="currentColor" offset="1" />
            </linearGradient>
            <linearGradient id={`${id}-table`} x1="0" y1="0" x2=".9" y2="1">
                <stop stopColor="#fff" stopOpacity=".8" /><stop stopColor="currentColor" stopOpacity=".4" offset=".48" /><stop stopColor="currentColor" offset="1" />
            </linearGradient>
        </defs>
        <path d="M0-41 18-34 29-18 32 0 29 18 18 34 0 41-18 34-29 18-32 0-29-18-18-34Z" fill={`url(#${id}-cut)`} />
        <path d="M-10-26 10-26 20-12 20 12 10 26-10 26-20 12-20-12Z" fill={`url(#${id}-table)`} />
        <path d="M0-41 10-26-10-26Z M18-34 20-12 29-18Z M32 0 20 12 29 18Z M18 34 10 26 0 41Z M-18 34-20 12-29 18Z M-32 0-20-12-29-18Z" fill="#fff" fillOpacity=".56" />
        <path d="M0-41-10-26-18-34Z M18-34 10-26 20-12Z M32 0 20-12 20 12Z M18 34 20 12 10 26Z M0 41-10 26-18 34Z M-32 0-20 12-20-12Z" fill="currentColor" fillOpacity=".7" />
        <path d="M-18-34-10-26 10-26 18-34M29-18 20-12 20 12 29 18M18 34 10 26-10 26-18 34M-29 18-20 12-20-12-29-18" stroke="#fff" strokeOpacity=".6" strokeWidth=".55" fill="none" />
        <path d="M-8-29 1-32 5-29" stroke="#fff" strokeOpacity=".9" strokeWidth="1.3" fill="none" />
    </g>;
}

/** Hand-drawn botanical goldwork: two stems, tapered marquise leaves, and a closed scroll. */
export function JewelSprig({ flip = false, className }: { flip?: boolean; className?: string }) {
    return <g className={className} transform={flip ? 'translate(100 0) scale(-1 1)' : undefined} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 67C30 60 51 39 88 18M17 63C13 50 22 42 32 44 43 47 36 59 30 55M42 45C47 26 63 23 64 32 65 38 58 41 54 37" strokeWidth=".85" />
        <path d="M23 59Q15 44 6 42 7 55 23 59ZM38 47Q30 30 21 29 22 43 38 47ZM51 37Q46 20 38 17 36 29 51 37ZM65 28Q67 12 77 8 78 21 65 28ZM81 21Q83 7 94 3 97 15 81 21Z" strokeWidth=".65" fill="currentColor" fillOpacity=".12" />
        <path d="M30 54Q44 56 50 49 40 46 30 54ZM51 37Q65 44 75 36 63 31 51 37ZM70 25Q84 31 95 24 84 18 70 25Z" strokeWidth=".6" fill="currentColor" fillOpacity=".18" />
        <path d="M9 65Q35 59 56 38" strokeWidth=".3" opacity=".65" />
    </g>;
}

export function GemSeal({ size = 28, className }: { size?: number; className?: string }) {
    return <svg className={className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <FacetedGem cx={50} cy={50} r={28} />
    </svg>;
}
