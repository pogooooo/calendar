import { Children, Fragment, cloneElement, isValidElement, type ReactNode } from 'react';
import type { MonthHeaderProps } from '../MonthHeader.types';
import AnimatedDateText from '../../parts/animatedDateText/AnimatedDateText';
import * as S from './GemMonthHeader.styles';

/** Preserve the existing navigation handlers and date animation; only compose its typography. */
function catalogueNavigation(node: ReactNode): ReactNode {
    if (!isValidElement<{ children?: ReactNode; text?: string }>(node)) return node;
    if (node.type === Fragment) return <Fragment>{Children.map(node.props.children, catalogueNavigation)}</Fragment>;
    if (node.type !== AnimatedDateText || typeof node.props.text !== 'string') return node;
    const korean = /^(\d{4}년)\s+(.+)$/.exec(node.props.text);
    const english = /^(.+)\s+(\d{4})$/.exec(node.props.text);
    if (!korean && !english) return node;
    const year = korean ? korean[1] : english![2];
    const month = korean ? korean[2] : english![1];
    return <S.DateComposition>
        <S.CatalogueDate role="group" aria-label={node.props.text}>
            <small aria-hidden="true">{year}</small>
            <span className="month" aria-hidden="true">{cloneElement(node, { text: month })}</span>
        </S.CatalogueDate>
        <S.CompactDate>{node}</S.CompactDate>
    </S.DateComposition>;
}

export default function GemMonthHeader({ navigation, filters }: MonthHeaderProps) {
    return <S.Header data-theme-layout="gem-month-header">
        <S.Emblem aria-hidden="true" viewBox="0 0 48 48">
            <path className="setting" d="M24 3 40 12 45 24 40 36 24 45 8 36 3 24 8 12Z" />
            <path className="stone" d="M24 8 36 15 40 24 36 33 24 40 12 33 8 24 12 15Z" />
            <path className="facets" d="m24 8-7 10-9 6 9 6 7 10 7-10 9-6-9-6Zm-7 10h14v12H17Zm7-10v10m0 12v10M8 24h9m14 0h9" />
            <path className="claws" d="m9 12 5 5m25-5-5 5M9 36l5-5m25 5-5-5" />
        </S.Emblem>
        <S.Navigation>{catalogueNavigation(navigation)}</S.Navigation>
        <S.Separator aria-hidden="true" />
        <S.Filters>{filters}</S.Filters>
    </S.Header>;
}
