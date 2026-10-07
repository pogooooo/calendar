"use client";
/**
 * Celestial 위젯의 장식 — 손잡이 줄 가운데의 작은 금 혼천의(3D 오브제, 멈춘 한 장).
 * 위젯 창은 투명 창이라 끝없이 다시 그리면 깜빡인다 — 오브제 무대가 /widget 에서는 한 장만 그리고 맥락도 곧 돌려준다.
 * 잠그면 손잡이 줄이 사라지고 그 자리를 내용이 쓰므로 함께 사라진다. 예전 모서리 나침 문양(글 뒤의 옅은 무늬)은 두지 않는다.
 */
import Objet from "@/components/objet/Objet";
import * as S from "./CelestialWidgetCharm.styles";

const MARK = { detail: "mark", still: true };

export default function CelestialWidgetCharm({ locked = false }: { locked?: boolean }) {
    if (locked) return null;
    return (
        <S.Jewel aria-hidden="true">
            <Objet name="celestial/armillary" size="100%" options={MARK} interaction="none" />
        </S.Jewel>
    );
}
