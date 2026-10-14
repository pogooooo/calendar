"use client";
/**
 * Maple 위젯의 장식 — 손잡이 줄(먹 하이라인) 한가운데에 얹은 오늘의 단풍잎 한 장(3D 오브제, 멈춘 한 장),
 * 모서리의 옅은 선화 잎이 있던 자리는 바탕 무늬(MapleWidgetDecor)의 수채 단풍 가지와 먹 카드 테가 맡는다.
 * 위젯 창은 투명 창이라 끝없이 다시 그리면 깜빡인다 — 오브제 무대가 /widget 에서는 한 장만 그리고 맥락도 곧 돌려준다.
 * 잠그면 손잡이 줄이 사라지고 그 자리를 내용이 쓰므로 잎도 함께 사라진다.
 */
import Objet from "@/components/objet/Objet";
import * as S from "./MapleWidgetCharm.styles";

const LEAF = { sprite: "today", still: true };

export default function MapleWidgetCharm({ locked = false }: { locked?: boolean }) {
    if (locked) return null;
    return (
        <S.Jewel aria-hidden="true">
            <Objet name="maple/leaf" size="100%" options={LEAF} interaction="none" />
        </S.Jewel>
    );
}
