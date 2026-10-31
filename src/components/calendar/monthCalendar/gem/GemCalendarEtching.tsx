import * as S from './GemCalendarEtching.styles';

/** Fixed-aspect metal corner settings never stretch with the calendar grid. */
export default function GemCalendarEtching({ month }: { month: Date }) {
    return <S.Etching aria-hidden="true" data-gem-month={month.getMonth()}>
        {['nw', 'ne', 'sw', 'se'].map(corner => <svg key={corner} className={corner} viewBox="0 0 64 64">
            <path className="metal" d="M3 53V18L18 3h35M8 43V20L20 8h23" />
            <path className="scroll" d="M6 32c7-2 6-11 13-13s11-6 13-13M12 29c4 1 8-2 7-6m10-11c1 4-2 8-6 7" />
            <path className="gem" d="m13 13 7-3 5 5-3 7-7 3-5-5Z" />
            <path className="facet" d="m13 13 6 3 6-1m-6 1 3 6m-3-6-4 9m4-9-9 4" />
            <path className="metal" d="M3 56v4m53-57h4" />
            <path className="glint" d="M19 6q0 11 10 11-10 0-10 11 0-11-10-11 10 0 10-11Z" />
        </svg>)}
    </S.Etching>;
}
