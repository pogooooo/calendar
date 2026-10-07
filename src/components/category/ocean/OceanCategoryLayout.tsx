"use client";

import { Plus, Trash2, Users } from "lucide-react";
import { useT } from "@/i18n/useT";
import type { CategoryLayoutProps } from "../CategoryLayout.types";
import * as O from "./OceanCategory.styles";

/**
 * 바다의 카테고리 — 위에 옆으로 흐르는 색 칩 띠, 아래에 고른 카테고리를 탭 없이 판 셋으로.
 *   [색·이름·설명] [멤버·만든 사람·지우기] | [할 일 목록 — 두 줄 높이]. 폰은 이름 → 할 일 → 멤버 순으로 한 줄.
 * 창(초대·내보내기)은 판 밖, 화면 맨 바깥에 둔다 — 판의 흐림(backdrop-filter)이 fixed 창을 판 안에 가두지 않게.
 * (Celestial·Maple: 별자리 워터마크 아래 왼쪽 세로 덱 | 오른쪽 표제부·탭)
 */
export default function OceanCategoryLayout({
    categories, selectedCategoryId, selectedCategory, select, onAdd, onDelete,
    plate, creator, description, members, todos, empty, dialogs,
}: CategoryLayoutProps) {
    const t = useT();

    return (
        <O.Page data-theme-layout="ocean-category">
            <O.Bar>
                <O.Heading>
                    <O.Title>{t.category.title}</O.Title>
                    <O.Count>{categories.length}</O.Count>
                </O.Heading>
                <O.AddButton type="button" onClick={onAdd}><Plus />{t.category.newCategory}</O.AddButton>
            </O.Bar>

            <O.Rail>
                {categories.map((cat, i) => {
                    const on = cat.id === selectedCategoryId;
                    const people = cat.participants?.length ?? 0;
                    return (
                        <O.Chip
                            key={cat.id}
                            type="button"
                            $color={cat.color}
                            $on={on}
                            aria-pressed={on}
                            style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}
                            onClick={() => select(cat.id)}
                        >
                            <i className="sw" aria-hidden="true" />
                            <span className="nm">{cat.name}</span>
                            {people > 1 && <span className="meta" aria-hidden="true"><Users />{people}</span>}
                        </O.Chip>
                    );
                })}
            </O.Rail>

            {selectedCategory ? (
                <O.Bento key={selectedCategory.id}>
                    <O.Panel $area="id" $at={0}>
                        {plate}
                        {description}
                    </O.Panel>
                    <O.Panel $area="todos" $at={1}>
                        {todos}
                    </O.Panel>
                    <O.Panel $area="team" $at={2}>
                        {members}
                        <O.PanelFoot>
                            {creator}
                            <O.Remove type="button" onClick={onDelete}>
                                <Trash2 />{t.category.deleteCategory}
                            </O.Remove>
                        </O.PanelFoot>
                    </O.Panel>
                </O.Bento>
            ) : (
                <O.Pick>{empty}</O.Pick>
            )}

            {dialogs}
        </O.Page>
    );
}
