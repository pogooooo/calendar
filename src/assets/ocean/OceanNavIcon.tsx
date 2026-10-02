import { Shell, CalendarDays, FolderKanban, Flag, Gift, Tags, SlidersHorizontal, Download, Plus, Check, Clock, MoreHorizontal } from 'lucide-react';
import type { NavIconName } from '../NavIcon';
const ICONS = { home:Shell,calendar:CalendarDays,project:FolderKanban,challenge:Flag,anniversary:Gift,category:Tags,settings:SlidersHorizontal,download:Download,plus:Plus,check:Check,watch:Clock,more:MoreHorizontal };
export default function OceanNavIcon({name,size}: {name:NavIconName;size:number}) { const Icon = ICONS[name]; return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />; }
