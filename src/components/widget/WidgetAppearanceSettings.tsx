"use client";
import {useId,useRef,useState,type CSSProperties} from 'react';
import {Check,Info,RotateCcw,X} from 'lucide-react';
import useWidgetStore,{type WidgetKind,type WidgetSettings,type BgMode} from '@/store/useWidgetStore';
import useSettingStore from '@/store/useSettingStore';
import {normalizeWidgetAppearance,resolveWidgetEffect,type WidgetAppearance} from '@/lib/widgetAppearance';
import {normalizeWidgetBackground,type WidgetBgSettings} from '@/lib/widgetBackground';
import {useWidgetMeta} from '@/hooks/useWidgetMeta';
import {useMotionHeldByOs} from '@/hooks/useThemeMotion';
import {usePickTheme} from '@/styles/themed';
import * as Celestial from './celestial/CelestialWidgetAppearance.styles';
import * as Maple from './maple/MapleWidgetAppearance.styles';
import * as Ocean from './ocean/OceanWidgetAppearance.styles';
import * as Gem from './gem/GemWidgetAppearance.styles';
import {DialogLayout} from './WidgetAppearance.styles';
import WidgetAppearancePreview from './WidgetAppearancePreview';

const STYLES={celestial:Celestial,maple:Maple,ocean:Ocean,gem:Gem};
const SECTIONS=['background','ornaments','motion'] as const;
type Section=typeof SECTIONS[number];

/** A temporary draft lets users clear a number before typing its replacement. */
function RangeControl({label,value,onChange,max=100,unit='%',disabled=false,low,high}:{label:string;value:number;onChange:(value:number)=>void;max?:number;unit?:string;disabled?:boolean;low:string;high:string}){
    const id=useId();
    const [draft,setDraft]=useState({source:value,text:String(value)});
    const text=draft.source===value?draft.text:String(value);
    const commit=(raw:string)=>{
        setDraft({source:value,text:raw});
        if(raw!==''&&Number.isFinite(Number(raw))&&Number(raw)>=0&&Number(raw)<=max)onChange(Number(raw));
    };
    return <div className="range-control" data-disabled={disabled||undefined}>
        <div className="range-label"><label htmlFor={id}>{label}</label><div className="numeric-value">
            <input type="number" aria-label={label+' '+unit} min={0} max={max} step={1} value={text} disabled={disabled}
                onChange={event=>commit(event.target.value)} onBlur={()=>{
                    const next=text===''||!Number.isFinite(Number(text))?value:Math.max(0,Math.min(max,Number(text)));
                    setDraft({source:next,text:String(next)});if(next!==value)onChange(next);
                }} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();event.currentTarget.blur();}}}/><span aria-hidden>{unit}</span>
        </div></div>
        <input id={id} type="range" min={0} max={max} step={1} value={value} disabled={disabled} style={{'--range-fill':`${value/max*100}%`} as CSSProperties} onChange={event=>onChange(Number(event.target.value))}/>
        <div className="range-ends" aria-hidden><span>{low}</span><span>{high}</span></div>
    </div>;
}

export default function WidgetAppearanceSettings({kind,compact=false,onDone,title}:{kind:WidgetKind;compact?:boolean;onDone?:()=>void;title?:string}){
    const id=useId(),ko=useSettingStore(state=>state.locale)==='ko';
    const text=(korean:string,english:string)=>ko?korean:english;
    const S=usePickTheme(STYLES),meta=useWidgetMeta()[kind];
    const label=title?.replace(/^CRONOS\s*·\s*/,'')??meta.label;
    const settings=useWidgetStore(state=>state[kind]);
    const a=normalizeWidgetAppearance(settings.appearance),bg=normalizeWidgetBackground(settings.bg);
    const [initial]=useState(()=>({appearance:normalizeWidgetAppearance(settings.appearance),bg:normalizeWidgetBackground(settings.bg)}));
    const [section,setSection]=useState<Section>('background');
    const [saveError,setSaveError]=useState(false);
    const [colorDraft,setColorDraft]=useState({source:bg.customColor,text:bg.customColor,error:false});
    const panel=useRef<HTMLDivElement>(null),retry=useRef<null|(()=>void)>(null);
    const appMotion=useSettingStore(state=>state.motion),heldByOs=useMotionHeldByOs();
    const effectiveMotion=heldByOs?'off':resolveWidgetEffect(appMotion,a.effect);
    const changed=JSON.stringify(initial)!==JSON.stringify({appearance:a,bg});
    const colorText=colorDraft.source===bg.customColor?colorDraft.text:bg.customColor;
    const colorError=colorDraft.source===bg.customColor&&colorDraft.error;

    const save=(patch:Partial<WidgetSettings>)=>{
        const action=()=>useWidgetStore.getState().update(kind,patch);
        retry.current=action;
        try{action();setSaveError(false);retry.current=null;}catch{setSaveError(true);}
    };
    const change=(appearance?:Partial<WidgetAppearance>,background?:Partial<WidgetBgSettings>)=>{
        const current=useWidgetStore.getState()[kind];
        save({...(appearance?{appearance:normalizeWidgetAppearance({...normalizeWidgetAppearance(current.appearance),...appearance})}:{}),
            ...(background?{bg:normalizeWidgetBackground({...normalizeWidgetBackground(current.bg),...background})}:{})});
    };
    const chooseSection=(next:Section)=>{setSection(next);panel.current?.scrollTo({top:0});};
    const applyLook=(look:'theme'|'ornaments'|'content')=>{
        change({design:look==='content'?'simple':'ornate',...(look==='content'?{}:{intensity:1})},look==='theme'?{mode:'theme',opacity:.92}:{opacity:0});
    };
    const selectedLook=bg.opacity===0?(a.design==='simple'?'content':a.intensity===1?'ornaments':null)
        :bg.mode==='theme'&&bg.opacity===.92&&a.design==='ornate'&&a.intensity===1?'theme':null;
    const commitColor=(raw:string,blur=false)=>{
        const match=raw.trim().match(/^#?([\da-f]{6})$/i);
        setColorDraft({source:bg.customColor,text:raw,error:blur&&!match});
        if(match)change(undefined,{customColor:'#'+match[1].toUpperCase()});
    };
    const sectionLabels={background:text('배경','Background'),ornaments:text('장식','Ornaments'),motion:text('움직임','Motion')};
    const motionLabels={inherit:text('앱 설정 따르기','Follow app'),full:text('풍성하게','Full'),gentle:text('잔잔하게','Gentle'),off:text('끄기','Off')};
    const sectionValues={background:`${Math.round(bg.opacity*100)}%`,ornaments:a.design==='simple'?text('숨김','Hidden'):`${Math.round(a.intensity*100)}%`,motion:motionLabels[effectiveMotion]};

    return <><DialogLayout/><S.Surface data-widget-appearance={kind} data-compact={compact?'':undefined}>
        <header className="settings-head"><div><span className="eyebrow">{text('위젯 꾸미기','Widget appearance')}</span><h3>{label}</h3></div>
            <span className="scope" title={text(`이 기기의 ${label} 위젯에 적용됩니다.`,`Applies to ${label} on this device.`)}>{text('이 위젯만','This widget only')}</span>
            {onDone&&<button type="button" className="icon-button" aria-label={text('위젯 설정 닫기','Close widget settings')} onClick={onDone}><X size={18}/></button>}
        </header>
        <div className="settings-workspace">
            <WidgetAppearancePreview kind={kind} label={label} appearance={a} bg={bg} compact={compact}/>
            <div className="settings-editor">
                <div className="section-tabs" role="tablist" aria-label={text('위젯 설정 항목','Widget settings sections')}>
                    {SECTIONS.map(value=><button type="button" key={value} role="tab" aria-label={sectionLabels[value]} aria-describedby={`${id}-${value}-value`} id={`${id}-${value}-tab`} aria-selected={section===value} aria-controls={`${id}-${value}-panel`} tabIndex={section===value?0:-1}
                        onClick={()=>chooseSection(value)} onKeyDown={event=>{
                            const index=SECTIONS.indexOf(value);const target=event.key==='ArrowRight'?SECTIONS[(index+1)%3]:event.key==='ArrowLeft'?SECTIONS[(index+2)%3]:event.key==='Home'?SECTIONS[0]:event.key==='End'?SECTIONS[2]:null;
                            if(target){event.preventDefault();chooseSection(target);event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`#${CSS.escape(id+'-'+target+'-tab')}`)?.focus();}
                        }}><span>{sectionLabels[value]}</span><small id={`${id}-${value}-value`}>{sectionValues[value]}</small></button>)}
                </div>
                <div ref={panel} className="settings-controls" role="tabpanel" id={`${id}-${section}-panel`} aria-labelledby={`${id}-${section}-tab`} tabIndex={0}>
                    {section==='background'&&<>
                        <fieldset><legend>{text('빠른 스타일','Quick styles')}</legend><div className="quick-looks">
                            {(['theme','ornaments','content'] as const).map(value=><button key={value} type="button" aria-pressed={selectedLook===value} onClick={()=>applyLook(value)}>
                                <strong>{({theme:text('테마 배경','Theme'),ornaments:text('장식만','Ornaments only'),content:text('내용만','Content only')})[value]}</strong>
                                <small>{({theme:text('배경과 장식','Backdrop + detail'),ornaments:text('배경 없이 장식','No backdrop'),content:text('배경·장식 숨김','No backdrop or detail')})[value]}</small>
                            </button>)}
                        </div></fieldset>
                        <p className="field-help">{text('배경과 장식을 함께 바꾸는 빠른 설정입니다. 움직임 강도는 유지됩니다.','These presets change backdrop and ornaments together, while keeping your motion preference.')}</p>
                        <RangeControl label={text('배경 불투명도','Background opacity')} value={Math.round(bg.opacity*100)} onChange={value=>change(undefined,{opacity:value/100})} low={text('투명하게','Transparent')} high={text('선명하게','Opaque')}/>
                        {bg.opacity===0&&<div className="context-note"><Info size={15}/><span>{text('배경은 숨겨져 있습니다. 불투명도를 올리면 선택한 배경이 보입니다.','The backdrop is hidden. Increase opacity to see the selected backdrop.')}</span></div>}
                        <fieldset><legend>{text('배경 종류','Backdrop type')}</legend><div className="choices three">
                            {(['theme','glass','custom'] as BgMode[]).map(value=><button key={value} type="button" aria-pressed={bg.mode===value} onClick={()=>change(undefined,{mode:value})}>
                                <Check size={13} className="selected-mark" aria-hidden/><span className="choice-label">{value==='theme'?text('테마','Theme'):value==='glass'?text('유리','Glass'):text('색상','Color')}</span>
                            </button>)}
                        </div></fieldset>
                        {bg.mode==='glass'&&<>
                            <RangeControl label={text('유리 흐림','Glass blur')} value={Math.round(bg.glassBlur??36.8)} max={40} unit="px" onChange={value=>change(undefined,{glassBlur:value})} low={text('또렷하게','Clear')} high={text('부드럽게','Soft')}/>
                            <div className="switch-row"><label htmlFor={id+'-gloss'}>{text('표면 반사광','Surface gloss')}</label><button id={id+'-gloss'} type="button" role="switch" aria-label={text('표면 반사광','Surface gloss')} aria-checked={!!bg.gloss} onClick={()=>change(undefined,{gloss:!bg.gloss})}><span/>{bg.gloss?text('켜짐','On'):text('꺼짐','Off')}</button></div>
                        </>}
                        {bg.mode==='custom'&&<div className="color-control"><label htmlFor={id+'-color-code'}>{text('배경 색상','Background color')}</label><div className="color-inputs">
                            <input type="color" aria-label={text('배경 색상 선택','Choose background color')} value={bg.customColor} onChange={event=>change(undefined,{customColor:event.target.value})}/>
                            <input id={id+'-color-code'} type="text" spellCheck={false} maxLength={7} value={colorText} aria-invalid={colorError} aria-describedby={colorError?id+'-color-error':undefined} onChange={event=>commitColor(event.target.value)} onBlur={()=>commitColor(colorText,true)} placeholder="#328F9B"/>
                        </div>{colorError&&<p className="error" id={id+'-color-error'} role="alert">{text('#328F9B처럼 여섯 자리 색상 코드를 입력해 주세요.','Enter a six-digit color such as #328F9B.')}</p>}</div>}
                        <div className="switch-row"><div><label htmlFor={id+'-contrast'}>{text('글자 대비 자동 조절','Automatic text contrast')}</label><p>{text('바탕에 맞춰 글자를 읽기 쉽게 조절합니다.','Adjust text for the backdrop.')}</p></div><button id={id+'-contrast'} type="button" role="switch" aria-label={text('글자 대비 자동 조절','Automatic text contrast')} aria-checked={bg.autoTextColor} onClick={()=>change(undefined,{autoTextColor:!bg.autoTextColor})}><span/>{bg.autoTextColor?text('켜짐','On'):text('꺼짐','Off')}</button></div>
                    </>}
                    {section==='ornaments'&&<>
                        <h4>{text('장식 표시와 진하기','Ornament visibility and opacity')}</h4>
                        <div className="choices two option-cards">
                            <button type="button" aria-pressed={a.design==='ornate'} onClick={()=>change({design:'ornate'})}><strong>{text('테마 장식','Theme ornaments')}</strong><small>{text('문양·물빛·단풍 그늘','Patterns, waterlight and leaves')}</small></button>
                            <button type="button" aria-pressed={a.design==='simple'} onClick={()=>change({design:'simple'})}><strong>{text('장식 숨기기','Hide ornaments')}</strong><small>{text('정보를 또렷하게','Focus on information')}</small></button>
                        </div>
                        <RangeControl label={text('장식 불투명도','Ornament opacity')} value={Math.round(a.intensity*100)} disabled={a.design==='simple'} onChange={value=>change({intensity:value/100})} low={text('숨김','Hidden')} high={text('선명하게','Vivid')}/>
                        <div className="context-note"><Info size={15}/><span>{a.design==='simple'?text('테마 장식을 켜면 진하기를 조절할 수 있습니다.','Enable ornaments to adjust their opacity.'):text('장식만 바뀝니다. 배경과 글자의 진하기는 유지됩니다.','Only ornaments change; backdrop and text stay the same.')}</span></div>
                    </>}
                    {section==='motion'&&<>
                        <h4>{text('움직임 강도','Motion intensity')}</h4>
                        <div className="choices two option-cards">
                            {(['inherit','full','gentle','off'] as const).map(value=><button key={value} type="button" aria-pressed={a.effect===value} onClick={()=>change({effect:value})}><strong>{motionLabels[value]}</strong><small>{({inherit:text('앱과 같은 움직임','Use the app preference'),full:text('테마 반응을 풍부하게','Rich theme feedback'),gentle:text('짧고 가벼운 반응','Brief, subtle feedback'),off:text('장식은 그대로, 움직임 없이','Keep detail without motion')})[value]}</small></button>)}
                        </div>
                        <div className="motion-summary"><span>{text('현재 적용','Currently applied')}</span><strong>{motionLabels[effectiveMotion]}</strong></div>
                        <div className="context-note"><Info size={15}/><span>{heldByOs?text('기기의 움직임 줄이기 설정으로 멈춰 있습니다.','Device reduced-motion settings currently stop animation.'):appMotion==='off'?text('앱에서 움직임을 꺼 두어 이 위젯도 멈춰 있습니다.','App motion is off, so this widget is also still.'):appMotion==='gentle'&&a.effect==='full'?text('앱 설정이 잔잔하게여서 위젯에도 잔잔하게 적용됩니다.','The app limits widget motion to Gentle.'):text('위젯에 포인터가 들어올 때의 반응에 적용됩니다. 장식과 투명도는 바뀌지 않습니다.','Applies to widget interaction feedback without changing ornaments or opacity.')}</span></div>
                    </>}
                </div>
            </div>
        </div>
        <footer className="settings-foot"><div className="save-status" role={saveError?'alert':'status'}>{saveError?<><Info size={15}/><span>{text('기기에 저장하지 못했습니다.','Could not save on this device.')}</span><button type="button" onClick={()=>{try{retry.current?.();setSaveError(false);retry.current=null;}catch{setSaveError(true);}}}>{text('재시도','Retry')}</button></>:<><Check size={15}/><span>{text('이 기기에 자동 저장','Saved on this device')}</span></>}</div>
            <button type="button" className="undo" disabled={!changed&&!saveError} title={text('배경·장식·움직임을 설정창을 열기 전 상태로 되돌립니다.','Restore backdrop, ornaments and motion from when this panel opened.')} aria-label={text('이번 설정창을 열기 전 상태로 되돌리기','Restore settings from when this panel opened')} onClick={()=>{save(initial);setColorDraft({source:initial.bg.customColor,text:initial.bg.customColor,error:false});}}><RotateCcw size={15}/><span>{text('열기 전으로','Undo changes')}</span></button>
            {onDone&&<button type="button" className="done" onClick={onDone}>{text('닫기','Close')}</button>}
        </footer>
    </S.Surface></>;
}
