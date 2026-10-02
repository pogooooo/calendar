import type { ReactNode, Ref } from 'react';
export interface CalendarLayoutProps { month: ReactNode; day: ReactNode; resizer: ReactNode; collapsed: boolean; containerRef: Ref<HTMLDivElement>; }
