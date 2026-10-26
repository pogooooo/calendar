"use client";

import { useId, useState } from 'react';
import { useTheme } from 'styled-components';
import useSettingStore from '@/store/useSettingStore';
import { clampColorChannel, DEFAULT_GEM_COLOR, hexToRgb, rgbToHex, type GemRgb } from '@/styles/gem/palette';
import * as S from './GemColorPicker.styles';

/** A cut stone in a small gold setting; SVG proportions remain fixed in every preview. */
export function GemMark() {
    const theme = useTheme();
    const id = useId();
    const color = theme.gemColor ?? DEFAULT_GEM_COLOR;
    return (
        <S.Mark viewBox="0 0 72 84" fill="none" aria-hidden="true">
            <defs>
                <linearGradient id={`${id}-metal`} x1="10" y1="5" x2="58" y2="78" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F2DEB9" /><stop offset=".32" stopColor="#A9814F" />
                    <stop offset=".64" stopColor="#F4DEB6" /><stop offset="1" stopColor="#A77B48" />
                </linearGradient>
                <linearGradient id={`${id}-shine`} x1="19" y1="10" x2="57" y2="72" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" stopOpacity=".75" /><stop offset=".4" stopColor="white" stopOpacity="0" />
                    <stop offset="1" stopColor="#0C071B" stopOpacity=".6" />
                </linearGradient>
            </defs>
            <path d="M24 8 48 8 63 26 59 57 46 76 26 76 13 57 9 26Z" fill={`url(#${id}-metal)`} />
            <path d="M25 11 47 11 60 27 56 56 45 73 27 73 16 56 12 27Z" fill={color} />
            <path d="M25 11 47 11 60 27 56 56 45 73 27 73 16 56 12 27Z" fill={`url(#${id}-shine)`} />
            <path d="M25 11 28 27 12 27ZM47 11 44 27 60 27ZM16 56 28 49 27 73ZM56 56 44 49 45 73Z" fill="white" fillOpacity=".32" />
            <path d="M25 11 47 11 44 27 28 27ZM12 27 28 27 23 38 16 56ZM60 27 44 27 49 38 56 56Z" fill="#100722" fillOpacity=".22" />
            <path d="M28 27 44 27 49 38 44 49 28 49 23 38Z" fill="white" fillOpacity=".22" stroke="white" strokeOpacity=".35" strokeWidth=".6" />
            <path d="M28 49 44 49 45 73 36 63 27 73Z" fill="white" fillOpacity=".12" />
            <path d="M25 9 28 15M47 9 44 15M15 55 20 53M57 55 52 53M27 75 29 69M45 75 43 69" stroke={`url(#${id}-metal)`} strokeWidth="3.1" strokeLinecap="round" />
            <path className="gem-glint" d="M52 13 53.3 18.7 59 20 53.3 21.3 52 27 50.7 21.3 45 20 50.7 18.7Z" fill="#FFF4DE" />
        </S.Mark>
    );
}

const PRESETS = [
    { color: DEFAULT_GEM_COLOR, ko: '자수정', en: 'Amethyst' },
    { color: '#D989A4', ko: '로즈 쿼츠', en: 'Rose quartz' },
    { color: '#57AFC5', ko: '아쿠아마린', en: 'Aquamarine' },
] as const;
const CHANNELS = ['r', 'g', 'b'] as const;

export default function GemColorPicker() {
    const id = useId();
    const color = useSettingStore(state => state.gemColor);
    const setColor = useSettingStore(state => state.setGemColor);
    const locale = useSettingStore(state => state.locale);
    const english = locale === 'en';
    const rgb = hexToRgb(color);
    const [editing, setEditing] = useState<keyof GemRgb | null>(null);
    const [draft, setDraft] = useState('');
    const channelName = english ? { r: 'Red', g: 'Green', b: 'Blue' } : { r: '빨강', g: '초록', b: '파랑' };

    const changeChannel = (channel: keyof GemRgb, value: number) => {
        setColor(rgbToHex({ ...rgb, [channel]: clampColorChannel(value) }));
    };

    return (
        <S.Panel aria-labelledby={`${id}-title`}>
            <S.Heading>
                <GemMark />
                <div>
                    <h3 id={`${id}-title`}>{english ? 'Your gemstone color' : '나만의 보석 색상'}</h3>
                    <p id={`${id}-hint`}>{english
                        ? 'Saved on this device. The stone keeps your RGB color; text contrast adjusts automatically.'
                        : '이 기기에 저장됩니다. 보석은 고른 RGB 색을 유지하고 글자 대비는 자동으로 조정됩니다.'}</p>
                </div>
            </S.Heading>
            <S.Controls>
                <S.ColorWell $color={color}>
                    <GemMark />
                    <span aria-hidden="true">{color}</span>
                    <input type="color" value={color} onChange={event => setColor(event.target.value)} aria-label={english ? 'Gemstone color' : '보석 색상'} aria-describedby={`${id}-hint`} />
                </S.ColorWell>
                <S.Channels>
                    {CHANNELS.map(channel => {
                        const minimum = rgbToHex({ ...rgb, [channel]: 0 });
                        const maximum = rgbToHex({ ...rgb, [channel]: 255 });
                        return (
                            <S.Channel key={channel} $track={`linear-gradient(90deg, ${minimum}, ${maximum})`}>
                                <label htmlFor={`${id}-${channel}`}>{channel.toUpperCase()}</label>
                                <input
                                    type="range" min={0} max={255} step={1} value={rgb[channel]}
                                    aria-label={`${channelName[channel]} ${english ? 'slider' : '슬라이더'}`}
                                    onChange={event => { setEditing(null); changeChannel(channel, Number(event.target.value)); }}
                                />
                                <input
                                    id={`${id}-${channel}`} type="number" inputMode="numeric" min={0} max={255} step={1}
                                    value={editing === channel ? draft : rgb[channel]}
                                    aria-label={`${channel.toUpperCase()} · ${channelName[channel]} (0–255)`}
                                    onFocus={() => { setEditing(channel); setDraft(String(rgb[channel])); }}
                                    onChange={event => {
                                        const value = event.target.value;
                                        setEditing(channel); setDraft(value);
                                        if (value.trim() && Number.isFinite(Number(value))) changeChannel(channel, Number(value));
                                    }}
                                    onBlur={event => {
                                        if (event.target.value.trim()) changeChannel(channel, Number(event.target.value));
                                        setEditing(null);
                                    }}
                                    onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }}
                                />
                            </S.Channel>
                        );
                    })}
                </S.Channels>
            </S.Controls>
            <S.Presets aria-label={english ? 'Gemstone presets' : '보석 색상 프리셋'}>
                {PRESETS.map(preset => (
                    <S.Preset key={preset.color} type="button" $color={preset.color} $active={color === preset.color}
                        aria-pressed={color === preset.color} onClick={() => setColor(preset.color)}>
                        {english ? preset.en : preset.ko}
                    </S.Preset>
                ))}
                <S.Reset type="button" onClick={() => setColor(DEFAULT_GEM_COLOR)}>{english ? 'Reset color' : '기본색으로'}</S.Reset>
            </S.Presets>
        </S.Panel>
    );
}
