"use client";
import {ThemeProvider,useTheme} from 'styled-components';
import {Check} from 'lucide-react';
import useSettingStore from '@/store/useSettingStore';
import {usePickTheme} from '@/styles/themed';
import {inkOnFill} from '@/styles/color';
import {widgetBackgroundStyle,type WidgetBgSettings} from '@/lib/widgetBackground';
import type {WidgetAppearance} from '@/lib/widgetAppearance';
import type {WidgetKind} from '@/lib/widgetKinds';
import * as Celestial from './celestial/CelestialWidgetShell.styles';
import * as Maple from './maple/MapleWidgetShell.styles';
import * as Ocean from './ocean/OceanWidgetShell.styles';
import * as Gem from './gem/GemWidgetShell.styles';
import WidgetDecor from './WidgetDecor';
import {WidgetMotionContext} from './WidgetMotionContext';
const SHELLS={celestial:Celestial,maple:Maple,ocean:Ocean,gem:Gem};

/** Read-only examples: no account data or widget actions are mounted. */
export default function WidgetAppearancePreview({kind,label,appearance:a,bg,compact}:{kind:WidgetKind;label:string;appearance:WidgetAppearance;bg:WidgetBgSettings;compact:boolean}){
    const ko=useSettingStore(state=>state.locale)==='ko',theme=useTheme(),W=usePickTheme(SHELLS);
    const text=(korean:string,english:string)=>ko?korean:english;
    const solid=bg.mode==='custom'?bg.customColor:theme.colors.surface;
    const previewTheme={...theme,baseColors:theme.colors,colors:{...theme.colors,surface:'transparent',...(bg.autoTextColor&&bg.mode!=='glass'&&bg.opacity>=.6?{text:inkOnFill(solid),textSecondary:inkOnFill(solid)}:{})}};
    return <aside className="appearance-preview" aria-label={text('장식과 색상 미리보기','Ornament and color preview')}>
        <div className="preview-heading"><strong>{text('미리보기','Preview')}</strong><span>{text('예시 데이터','Sample data')}</span></div>
        <div className="sample" data-preview-compact={compact||undefined} role="img" aria-label={text(`예시 미리보기 · 배경 ${Math.round(bg.opacity*100)}% · 장식 ${a.design==='simple'?0:Math.round(a.intensity*100)}%`,`Sample preview · backdrop ${Math.round(bg.opacity*100)}% · ornaments ${a.design==='simple'?0:Math.round(a.intensity*100)}%`)}>
            <ThemeProvider theme={previewTheme}>
                <W.BackgroundSurface aria-hidden data-widget-preview-background data-ornate={a.design==='ornate'&&bg.mode==='theme'} style={{...widgetBackgroundStyle(bg,theme.colors.surface),inset:0,backdropFilter:bg.mode==='glass'?`blur(${bg.glassBlur??36.8}px)`:'none',WebkitBackdropFilter:bg.mode==='glass'?`blur(${bg.glassBlur??36.8}px)`:'none'}}>{bg.mode==='glass'&&bg.gloss&&<W.GlossOverlay/>}</W.BackgroundSurface>
                <WidgetMotionContext.Provider value="off">{a.design==='ornate'&&<WidgetDecor kind={kind} locked intensity={a.intensity}/>}</WidgetMotionContext.Provider>
                <div className="sample-content" aria-hidden style={{color:previewTheme.colors.text}}>
                    {kind==='monthly'||kind==='weekly'?<><strong>{text('11월의 기록','November journal')}</strong><div className="mini-calendar">
                        {(ko?['일','월','화','수','목','금','토']:['S','M','T','W','T','F','S']).map((day,index)=><small key={index}>{day}</small>)}
                        {Array.from({length:kind==='weekly'?7:28},(_,index)=><span key={index} className={`${index===3?'sample-today ':''}${index>=14?'sample-extra':''}`}>{index+1}</span>)}
                    </div></>:kind==='anniversary'?<><span className="sample-kicker">{text('다가오는 기념일','Upcoming anniversary')}</span><strong className="sample-count">D−12</strong><span>{text('함께한 날','Our day')}</span></>:<><strong>{kind==='projects'?text('프로젝트 기록','Project journal'):kind==='challenge'?text('작은 습관','Daily habit'):kind==='due'?text('오늘 마감','Due today'):kind==='nownext'?text('지금과 다음','Now and next'):text('오늘의 기록','Today’s journal')}</strong>
                        {kind==='memo'?<p className="sample-note">{text('작은 일도 놓치지 않기.','Make room for the little things.')}</p>:<><div className="sample-row"><span className="sample-time">10:30</span><span>{text('다음 일정 확인하기','Review the next event')}</span></div><div className="sample-row sample-extra"><Check size={13}/><span>{text('마무리한 일 기록하기','Record what is done')}</span></div></>}
                        {(kind==='projects'||kind==='challenge'||kind==='stats')&&<div className="sample-progress sample-extra"><i/></div>}
                    </>}
                </div>
            </ThemeProvider>
        </div>
        <div className="preview-caption"><span>{text('배경','Backdrop')} {Math.round(bg.opacity*100)}%</span><span>{text('장식','Ornaments')} {a.design==='simple'?0:Math.round(a.intensity*100)}%</span></div>
        <p className="preview-scope">{text(`이 기기의 ${label} 위젯에 바로 적용됩니다.`,`Changes apply immediately to ${label} on this device.`)}</p>
        <p className="preview-note">{text('체크무늬는 투명한 부분입니다. 실제 위젯에서는 바탕화면이 보입니다.','The checkerboard marks transparency. Your wallpaper shows through in the widget.')}</p>
    </aside>;
}
