"use client";

import useSettingStore from '@/store/useSettingStore';
import ko from './ko';
import en from './en';

export { type Locale } from './types';

export function useT() {
    const locale = useSettingStore((s) => s.locale);
    return locale === 'en' ? en : ko;
}
