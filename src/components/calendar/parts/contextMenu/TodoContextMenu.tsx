"use client";

import * as GemS from "./gem/TodoContextMenu.styles";
import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TodoType } from "@/store/useTodoStore";
import { useT } from "@/i18n/useT";
import useThemeMotion from '@/hooks/useThemeMotion';
import { isOccurrenceDone } from '@/lib/todoDone';
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/TodoContextMenu.styles";
import * as MapleS from "./maple/TodoContextMenu.styles";
import * as OceanS from './ocean/TodoContextMenu.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

export interface ContextMenuTodo extends TodoType {
    originalTodo?: TodoType;
    date?: Date;
}

interface TodoContextMenuProps {
    menuState: { x: number; y: number; todo: ContextMenuTodo } | null;
    onClose: () => void;
    onToggle: (todo: ContextMenuTodo) => void;
    onEdit: (todo: ContextMenuTodo) => void;
    onDelete: (todo: ContextMenuTodo) => void;
    onDeleteOne?: (todo: ContextMenuTodo) => void;
}

export default function TodoContextMenu({ menuState, onClose, onToggle, onEdit, onDelete, onDeleteOne }: TodoContextMenuProps) {
    const S = usePickTheme(STYLES);
    const t = useT();
    const m = t.menu;
    const motionLevel=useThemeMotion();
    const menuRef = React.useRef<HTMLDivElement>(null);
    const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null);
    React.useEffect(()=>{
        if(!menuState) return;
        const previous=document.activeElement instanceof HTMLElement ? document.activeElement : null;
        menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
        return ()=>{if(previous?.isConnected) previous.focus({preventScroll:true});};
    },[menuState]);

    React.useEffect(() => {
        const handleClickOutside = () => onClose();
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, [onClose]);

    React.useLayoutEffect(() => {
        if (!menuState || !menuRef.current) {
            setPos(null);
            return;
        }

        const rect = menuRef.current.getBoundingClientRect();
        const margin = 8;
        const halfWidth = rect.width / 2;

        const minLeft = halfWidth + margin;
        const maxLeft = window.innerWidth - halfWidth - margin;
        const left = maxLeft < minLeft
            ? window.innerWidth / 2
            : Math.min(Math.max(menuState.x, minLeft), maxLeft);

        const wouldOverflowBottom = menuState.y + 10 + rect.height > window.innerHeight - margin;
        const top = wouldOverflowBottom
            ? Math.max(margin, menuState.y - rect.height - 10)
            : menuState.y;

        setPos({ left, top });
    }, [menuState]);

    if (typeof document === "undefined") return null;

    const isRepeat = menuState
        ? (menuState.todo.originalTodo?.repeat ?? menuState.todo.repeat ?? 0) > 0
        : false;

    return createPortal(
        <AnimatePresence>
            {menuState && (
                <S.FloatingContextMenu
                    ref={menuRef}
                    role="menu"
                    aria-label={menuState.todo.title}
                    onKeyDown={(event:React.KeyboardEvent)=>{
                        if(event.key==='Escape' || event.key==='Tab') {if(event.key==='Escape') event.preventDefault();onClose();return;}
                        if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
                        event.preventDefault();
                        const buttons=Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('button')??[]);
                        const index=buttons.indexOf(document.activeElement as HTMLButtonElement);
                        const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
                        buttons[next]?.focus();
                    }}
                    as={motion.div}
                    initial={motionLevel==='off'?false:{ opacity:0, scale:motionLevel==='full'?.96:1, x:'-50%', y:10 }}
                    animate={{ opacity:1, scale:1, x:'-50%', y:10 }}
                    exit={{ opacity:0, scale:1, x:'-50%', y:10 }}
                    transition={{ duration:motionLevel==='off'?0:.15 }}
                    style={{ top: pos ? pos.top : menuState.y, left: pos ? pos.left : menuState.x }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    <button role="menuitem" onClick={() => onToggle(menuState.todo)}>{isOccurrenceDone(menuState.todo) ? `${m.done} ${t.interaction.undo}` : m.done}</button>
                    <div className="divider" />
                    <button role="menuitem" onClick={() => onEdit(menuState.todo)}>{m.edit}</button>
                    <div className="divider" />
                    {isRepeat && onDeleteOne ? (
                        <>
                            <button role="menuitem" className="danger" onClick={() => onDeleteOne(menuState.todo)}>{m.deleteThisOnly}</button>
                            <div className="divider" />
                            <button role="menuitem" className="danger" onClick={() => onDelete(menuState.todo)}>{m.deleteAll}</button>
                        </>
                    ) : (
                        <button role="menuitem" className="danger" onClick={() => onDelete(menuState.todo)}>{m.delete}</button>
                    )}
                </S.FloatingContextMenu>
            )}
        </AnimatePresence>,
        document.body,
    );
}
