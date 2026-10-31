"use client";
import {useId} from 'react';
import useWidgetStore,{type WidgetKind,type BgMode} from '@/store/useWidgetStore';
import useSettingStore from '@/store/useSettingStore';
import {normalizeWidgetAppearance} from '@/lib/widgetAppearance';
import {normalizeWidgetBackground,widgetBackgroundStyle} from '@/lib/widgetBackground';
import {usePickTheme} from '@/styles/themed';
import {useTheme} from 'styled-components';
import * as CelestialShell from './celestial/CelestialWidgetShell.styles';
import * as MapleShell from './maple/MapleWidgetShell.styles';
import * as OceanShell from './ocean/OceanWidgetShell.styles';
import * as GemShell from './gem/GemWidgetShell.styles';
import * as Celestial from './celestial/CelestialWidgetAppearance.styles';
import * as Maple from './maple/MapleWidgetAppearance.styles';
import * as Ocean from './ocean/OceanWidgetAppearance.styles';
import * as Gem from './gem/GemWidgetAppearance.styles';
import WidgetDecor from './WidgetDecor';
import {WidgetMotionContext} from './WidgetMotionContext';
const STYLES={celestial:Celestial,maple:Maple,ocean:Ocean,gem:Gem};
const SHELLS={celestial:CelestialShell,maple:MapleShell,ocean:OceanShell,gem:GemShell};

/** Both the app's widget gallery and the widget itself edit the same per-kind preferences. */
export default function WidgetAppearanceSettings({kind,compact=false,onDone,title}:{kind:WidgetKind;compact?:boolean;onDone?:()=>void;title?:string}) {
    const id=useId(),ko=useSettingStore(s=>s.locale)==='ko';
    const text=(a:string,b:string)=>ko?a:b;
    const S=usePickTheme(STYLES);
    const W=usePickTheme(SHELLS),theme=useTheme();
    const settings=useWidgetStore(s=>s[kind]),update=useWidgetStore(s=>s.updateAppearance),updateBg=useWidgetStore(s=>s.updateBg);
    const a=normalizeWidgetAppearance(settings.appearance),bg=normalizeWidgetBackground(settings.bg);
    return <S.Surface data-widget-appearance={kind} data-compact={compact?'':undefined}>
        <header><h3>{title?`${title} · `:''}{text('위젯 꾸미기','Widget appearance')}</h3><p>{text('이 위젯에만 적용 · 변경 즉시 저장','Only this widget · saved automatically')}</p></header>
        {!compact&&<div className="sample" aria-label={text('디자인 미리보기 · 예시','Design preview · sample')}>
            <W.BackgroundSurface data-widget-preview-background aria-hidden data-ornate={a.design==='ornate' && bg.mode==='theme'} style={{...widgetBackgroundStyle(bg,theme.colors.surface),inset:0}}/>
            <WidgetMotionContext.Provider value={a.effect}>{a.design==='ornate'&&<WidgetDecor kind={kind} locked intensity={a.intensity}/>}</WidgetMotionContext.Provider>
            <div><strong>{text('오늘의 기록','Today’s journal')}</strong><span>10:30 · {text('다음 일정 확인하기','Review the next event')}</span></div>
        </div>}
        <fieldset><legend>{text('디자인','Design')}</legend><div className="choices">
            {(['simple','ornate'] as const).map(v=><button key={v} type="button" aria-pressed={a.design===v} onClick={()=>update(kind,{design:v})}>{v==='simple'?text('간결하게','Simple'):text('테마 장식','Ornate')}</button>)}
        </div><label htmlFor={id+'-detail'}>{text('장식 불투명도','Ornament opacity')}<output>{Math.round(a.intensity*100)}%</output></label>
        <input id={id+'-detail'} type="range" min="0" max="100" value={Math.round(a.intensity*100)} disabled={a.design==='simple'} onChange={e=>update(kind,{intensity:Number(e.target.value)/100})}/></fieldset>
        <fieldset><legend>{text('이펙트','Effects')}</legend><div className="choices">
            {(['inherit','full','gentle','off'] as const).map(v=><button key={v} type="button" aria-pressed={a.effect===v} onClick={()=>update(kind,{effect:v})}>{({inherit:text('앱 설정','App setting'),full:text('풍성하게','Full'),gentle:text('잔잔하게','Gentle'),off:text('끄기','Off')})[v]}</button>)}
        </div><p>{text('장식은 유지하면서 움직임만 끌 수 있습니다. 앱에서 움직임을 끄면 위젯도 멈춥니다.','Keep ornaments while turning motion off. Turning app motion off also stops widgets.')}</p></fieldset>
        <fieldset><legend>{text('배경','Background')}</legend><div className="choices">
            {(['theme','glass','custom'] as BgMode[]).map(v=><button key={v} type="button" aria-pressed={bg.mode===v} onClick={()=>updateBg(kind,{mode:v})}>{v==='theme'?text('테마','Theme'):v==='glass'?text('유리','Glass'):text('색상','Color')}</button>)}
        </div>
        <label htmlFor={id+'-opacity'}>{text('배경 불투명도','Background opacity')}<output>{Math.round(bg.opacity*100)}%</output></label>
        <input id={id+'-opacity'} type="range" min="0" max="100" value={Math.round(bg.opacity*100)} onChange={e=>updateBg(kind,{opacity:Number(e.target.value)/100})}/>
        <p>{text('0%로 하면 바탕 면이 사라지고 글자와 장식은 유지됩니다.','At 0%, the backdrop disappears while text and ornaments remain.')}</p>
        <button type="button" onClick={()=>{updateBg(kind,{opacity:0});update(kind,{design:'ornate',intensity:1});}}>{text('배경 없이 장식만','Ornaments without background')}</button>
        {bg.mode==='glass'&&<><label htmlFor={id+'-blur'}>{text('유리 흐림','Glass blur')}<output>{Math.round(bg.glassBlur ?? 36.8)}px</output></label><input id={id+'-blur'} type="range" min="0" max="40" value={bg.glassBlur ?? 36.8} onChange={e=>updateBg(kind,{glassBlur:Number(e.target.value)})}/></>}
        {bg.mode==='glass'&&<label>{text('표면 반사광','Surface gloss')}<button type="button" aria-label={text('표면 반사광','Surface gloss')} aria-pressed={!!bg.gloss} onClick={()=>updateBg(kind,{gloss:!bg.gloss})}>{bg.gloss?'ON':'OFF'}</button></label>}
        {bg.mode==='custom'&&<label htmlFor={id+'-color'}>{text('배경 색상','Background color')}<input id={id+'-color'} type="color" value={bg.customColor} onChange={e=>updateBg(kind,{customColor:e.target.value})}/><output>{bg.customColor}</output></label>}
        <label>{text('글자 대비 자동 조절','Automatic text contrast')}<button type="button" aria-label={text('글자 대비 자동 조절','Automatic text contrast')} aria-pressed={bg.autoTextColor} onClick={()=>updateBg(kind,{autoTextColor:!bg.autoTextColor})}>{bg.autoTextColor?'ON':'OFF'}</button></label></fieldset>
        {onDone&&<button type="button" className="done" onClick={onDone}>{text('완료','Done')}</button>}
    </S.Surface>;
}
