"use client";

import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import { useT } from "@/i18n/useT";
import type { CategoryLayoutProps } from "../CategoryLayout.types";

const ROMAN = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
];

/**
 * Celestial(과 Maple)의 카테고리 배치 — 별자리 워터마크 아래 왼쪽 카드 덱 | 오른쪽 표제부·탭·내용.
 * 예전 CategoryView 의 뼈대를 그대로 옮겼다. 모양은 받은 S(갈래의 *.styles)가 입힌다.
 */
export default function CelestialCategoryLayout({
    S, categories, selectedCategoryId, selectedCategory, select, onAdd, onDelete,
    activeTab, plate, tabs, creator, description, members, todos, empty, dialogs,
}: CategoryLayoutProps) {
    const t = useT();

    return (
        <S.CategoryWrapper>
        <S.CenterWrapper>
            <S.Zodiac viewBox="0 0 400 400" aria-hidden>
                <circle className="dashed" cx="200" cy="200" r="190" />
                <circle cx="200" cy="200" r="160" />
                {Array.from({ length: 24 }, (_, i) => (
                    <line key={i} x1="200" y1="14" x2="200" y2="26" transform={`rotate(${i * 15} 200 200)`} />
                ))}
            </S.Zodiac>

            <S.PageHeader>
                <i />
                <span>{t.category.title}</span>
                <hr />
            </S.PageHeader>

            <S.BodyRow>
            <S.SidebarContainer>
                <S.CategoryList>
                    {categories.map((cat, idx) => {
                        const isSelected = selectedCategoryId === cat.id;
                        return (
                            <S.DeckCard
                                key={cat.id}
                                type="button"
                                $color={cat.color}
                                $isSelected={isSelected}
                                style={{ animationDelay: `${Math.min(idx, 10) * 45}ms` }}
                                onClick={() => select(cat.id)}
                            >
                                <span className="num">{ROMAN[idx] ?? String(idx + 1)}</span>
                                <span className="chip" />
                                <span className="nm">{cat.name}</span>
                                {isSelected && <span className="mark">✦</span>}
                            </S.DeckCard>
                        );
                    })}

                    <S.DeckAddCard type="button" onClick={onAdd}>
                        {t.category.addCategory}
                    </S.DeckAddCard>
                </S.CategoryList>
            </S.SidebarContainer>

            <S.ContentContainer>
                {selectedCategory ? (
                    <S.DetailInfo key={selectedCategory.id}>
                        {/* ── 표제부 ── */}
                        {plate}

                        {/* ── 탭 ── */}
                        {tabs}

                        {activeTab === 'info' ? (
                            <S.InfoContainer>
                                {/* 점선 리더 속성 */}
                                {creator}

                                {description}

                                {/* 멤버 메달 */}
                                <div>
                                    {members}
                                </div>

                                <S.ActionFooter>
                                    <SecondaryButton $height={32} $width={140} $variant="danger" onClick={onDelete}>
                                        {t.category.deleteCategory}
                                    </SecondaryButton>
                                </S.ActionFooter>
                            </S.InfoContainer>
                        ) : (
                            <S.TodoListContainer>
                                {todos}
                            </S.TodoListContainer>
                        )}
                    </S.DetailInfo>
                ) : (
                    empty
                )}
            </S.ContentContainer>
            </S.BodyRow>
        </S.CenterWrapper>

            {dialogs}
        </S.CategoryWrapper>
    );
}
