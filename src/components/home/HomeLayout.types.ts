import type { HTMLAttributes, ReactNode } from 'react';

/** Shared content and actions; each theme owns its hierarchy and placement. */
export interface HomeLayoutProps {
    arch: ReactNode;
    navigation: ReactNode;
    today: ReactNode;
    upcoming: ReactNode;
    projects: ReactNode;
    challenges: ReactNode;
    anniversaries: ReactNode;
    dialogs: ReactNode;
    listProps: HTMLAttributes<HTMLDivElement>;
}
