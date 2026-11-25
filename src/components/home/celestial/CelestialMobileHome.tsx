import type { HTMLAttributes, ReactNode } from 'react';
import { useT } from '@/i18n/useT';
import useSettingStore from '@/store/useSettingStore';
import ReadingSeal from '@/components/ornament/celestial/ReadingSeal';
import { Plus } from 'lucide-react';
import type { HomeLayoutProps } from '../HomeLayout.types';
import * as S from './CelestialMobileHome.styles';

interface Props extends Omit<HomeLayoutProps, 'arch' | 'today' | 'listProps'> {
    complete: number;
    active: number;
    remaining: number;
    isToday: boolean;
    month: number;
    next?: string;
    onAdd: () => void;
    quick: ReactNode;
    pendingRows: ReactNode;
    completedRows: ReactNode;
    listProps: HTMLAttributes<HTMLDivElement>;
}

export default function CelestialMobileHome(p: Props) {
    const t = useT();
    const ko = useSettingStore(s => s.locale) === 'ko';
    const total = p.complete + p.active + p.remaining;
    return <S.Home data-theme-layout="celestial-mobile-home">
        <S.Masthead>
            <h1><i aria-hidden="true">✦</i>{t.sidebar.home}</h1>
            <div>
                <span>{t.home.monthLabel(p.month)}</span>
                <button type="button" aria-label={t.calendar.newTodo} onClick={p.onAdd}><Plus size={16} /></button>
            </div>
        </S.Masthead>
        <div {...p.listProps}>
            <S.Summary>
                <S.Seal><ReadingSeal /><b>{p.complete} / {total}</b></S.Seal>
                <h2>{ko ? (p.isToday ? '오늘의 완료 현황' : '선택한 날의 완료 현황') : (p.isToday ? 'Today’s progress' : 'Daily progress')}</h2>
                {p.next && <p>{ko ? '다음 일정' : 'Next'} · {p.next}</p>}
                <S.Stats>
                    <span>{t.menu.done} <b>{p.complete}{ko && '건'}</b></span>
                    <span>{ko ? '진행 중' : 'In progress'} <b>{p.active}{ko && '건'}</b></span>
                    <span>{ko ? '남은 일정' : 'Upcoming'} <b>{p.remaining}{ko && '건'}</b></span>
                </S.Stats>
            </S.Summary>
            <S.List>
                <S.Heading><span aria-hidden="true">✦</span><h2>{ko ? '이어서 할 일' : 'To do'}</h2><i /><small>{p.active + p.remaining}</small></S.Heading>
                {p.active + p.remaining ? p.pendingRows : <S.Empty>{p.isToday ? t.home.noTodayTodos : t.home.noDayTodos}</S.Empty>}
            </S.List>
            <S.List $paper>
                <S.Heading><span aria-hidden="true">◉</span><h2>{ko ? '완료한 일정' : 'Completed'}</h2><i /><small>{p.complete}</small></S.Heading>
                {p.complete ? p.completedRows : <S.Empty>{ko ? '완료한 일정이 없어요.' : 'No completed events.'}</S.Empty>}
            </S.List>
        </div>
        <S.Secondary>
            <div>{p.navigation}</div>
            <div>{p.quick}</div>
            <section>{p.upcoming}</section>
            <section>{p.projects}</section>
            <section>{p.challenges}</section>
            <section>{p.anniversaries}</section>
        </S.Secondary>
        {p.dialogs}
    </S.Home>;
}
