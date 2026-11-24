import type { HomeLayoutProps } from "../HomeLayout.types";
import * as S from "./GemHomeLayout.styles";

export default function GemHomeLayout(p: HomeLayoutProps) {
    return <S.Home data-theme-layout="gem-home">
        <S.Header>{p.arch}<nav>{p.navigation}</nav></S.Header>
        <S.ReadingGrid data-gem-route-content {...p.listProps}>{p.today}{p.upcoming}</S.ReadingGrid>
        <S.Collections data-gem-route-content><section>{p.projects}</section><section>{p.challenges}</section><section>{p.anniversaries}</section></S.Collections>
        {p.dialogs}
    </S.Home>;
}
