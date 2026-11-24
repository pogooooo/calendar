"use client";
import {useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import styled from 'styled-components';
import {useThemeFamily} from '@/styles/themed';
import useThemeMotion from '@/hooks/useThemeMotion';
import { boxesOf } from '@/hooks/useMotion';
import * as Ocean from './ocean/OceanPageTransition.styles';
import * as Maple from './maple/MaplePageTransition.styles';

const ORDER=['/','/calendar','/project','/challenge','/category','/anniversary','/settings','/download'];
const rank=(p:string)=>ORDER.findIndex(r=>r==='/'?p===r:p===r||p.startsWith(`${r}/`));
const useRouteEffect=typeof window==='undefined'?useEffect:useLayoutEffect;

/** Stable body preserves dates and drafts when the theme changes; only ornaments are replaced. */
export default function PageTransition({children}:{children:ReactNode}) {
    const path=usePathname(),family=useThemeFamily(),motion=useThemeMotion();
    const body=useRef<HTMLDivElement>(null),previous=useRef(path);
    const [nav,setNav]=useState<{path:string;dir:1|-1;navigated:boolean}>({path,dir:1,navigated:false});
    if(nav.path!==path)setNav({path,dir:rank(path)<rank(nav.path)?-1:1,navigated:true});
    const {dir,navigated}=nav;
    useRouteEffect(()=>{
        const changed=previous.current!==path;
        previous.current=path;
        // Preference changes cancel immediately without replaying the route entrance.
        if(!changed||motion==='off'||family==='ocean'||!body.current)return;
        if(family==='gem'){
            const regions = body.current.querySelectorAll('[data-gem-route-content]');
            const animations = Array.from(regions).flatMap(boxesOf).map(region => region.animate(
                [{ opacity: .72 }, { opacity: 1 }],
                { duration: motion === 'gentle' ? 130 : 210, easing: 'ease-out' },
            ));
            return () => animations.forEach(animation => animation.cancel());
        }
        const frames=motion==='gentle'?[{opacity:.75},{opacity:1}]:[{opacity:.55},{opacity:1}];
        const animation=body.current.animate(frames,{duration:motion==='gentle'?140:family==='maple'?360:240,easing:'cubic-bezier(.16,1,.3,1)'});
        return()=>animation.cancel();
    },[path,family,motion,dir]);
    return <Stage><Body ref={body}>{children}</Body>
        {navigated&&motion==='full'&&family==='maple'&&<Maple.PageEdge key={path} $dir={dir} $gentle={false} aria-hidden/>}
        {navigated&&motion!=='off'&&family==='ocean'&&<Ocean.Veil key={path} $dir={dir} $gentle={motion==='gentle'} aria-hidden data-page-transition-overlay/>}
    </Stage>;
}
const Stage=styled.div`position:relative;height:100%;`;
const Body=styled.div`position:relative;height:100%;`;
