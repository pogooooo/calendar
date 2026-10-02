import type { HomeLayoutProps } from '../HomeLayout.types';
import Seashell from '@/assets/ocean/Seashell';
import * as S from './OceanHomeLayout.styles';
export default function OceanHomeLayout(p: HomeLayoutProps) {
    return <S.Beach data-theme-layout="ocean-home">
        <S.Horizon><div>{p.navigation}{p.arch}</div><Seashell /></S.Horizon>
        <S.DailyShore {...p.listProps}>{p.today}{p.upcoming}</S.DailyShore>
        <S.ShellCollection><section>{p.challenges}</section><section>{p.projects}</section><section>{p.anniversaries}</section></S.ShellCollection>{p.dialogs}
    </S.Beach>;
}
