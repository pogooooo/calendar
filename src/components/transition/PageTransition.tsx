"use client";
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import styled from 'styled-components';
import {useThemeFamily} from '@/styles/themed';
import useThemeMotion from '@/hooks/useThemeMotion';
import * as Ocean from './ocean/OceanPageTransition.styles';
import * as Maple from './maple/MaplePageTransition.styles';
import * as Gem from './gem/GemPageTransition.styles';

const ORDER=['/','/calendar','/project','/challenge','/category','/anniversary','/settings','/download'];
const rank=(p:string)=>ORDER.findIndex(r=>r==='/'?p===r:p===r||p.startsWith(`${r}/`));

/** Stable body preserves dates and drafts when the theme changes; only ornaments are replaced. */
export default function PageTransition({children}:{children:ReactNode}) {
    const path=usePathname(),family=useThemeFamily(),motion=useThemeMotion();
    const body=useRef<HTMLDivElement>(null),previous=useRef(path),animation=useRef<Animation|null>(null);
    const [nav,setNav]=useState<{path:string;dir:1|-1;navigated:boolean}>({path,dir:1,navigated:false});
    if(nav.path!==path)setNav({path,dir:rank(path)<rank(nav.path)?-1:1,navigated:true});
    const {dir,navigated}=nav;
    useEffect(()=>{
        const changed=previous.current!==path;
        previous.current=path;
        animation.current?.cancel();
        // Preference changes cancel immediately without replaying the route entrance.
        if(!changed||motion==='off'||family==='ocean'||!body.current)return;
        const frames=motion==='gentle'?[{opacity:.75},{opacity:1}]:family==='gem'
            ?[{opacity:.55,translate:`${dir*9}px 0`,filter:'brightness(1.08)'},{opacity:1,translate:'0 0',filter:'brightness(1)'}]
            :[{opacity:.55},{opacity:1}];
        animation.current=body.current.animate(frames,{duration:motion==='gentle'?140:family==='maple'?360:family==='gem'?460:240,easing:'cubic-bezier(.16,1,.3,1)'});
        return()=>animation.current?.cancel();
    },[path,family,motion,dir]);
    return <Stage><Body ref={body}>{children}</Body>
        {navigated&&motion==='full'&&family==='maple'&&<Maple.PageEdge key={path} $dir={dir} $gentle={false} aria-hidden/>}
        {navigated&&motion!=='off'&&family==='ocean'&&<Ocean.Veil key={path} $dir={dir} $gentle={motion==='gentle'} aria-hidden data-page-transition-overlay/>}
        {navigated&&motion==='full'&&family==='gem'&&<Gem.Overlay key={path} $dir={dir} aria-hidden data-page-transition-overlay><span className="refraction"/><span className="gold-edge"/></Gem.Overlay>}
    </Stage>;
}
const Stage=styled.div`position:relative;height:100%;`;
const Body=styled.div`position:relative;height:100%;`;
