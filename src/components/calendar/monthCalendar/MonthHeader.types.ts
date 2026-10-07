import type { ReactNode } from 'react';
/** month 는 지금 펼친 달 — 갈래가 제 글씨로 달 이름을 따로 그릴 때 쓴다 (바다의 "October") */
export interface MonthHeaderProps { navigation: ReactNode; filters: ReactNode; month?: Date; }
