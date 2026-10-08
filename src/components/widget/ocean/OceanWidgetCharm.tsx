"use client";
/**
 * Ocean 위젯의 장식 — 머리 줄의 빈자리(손잡이 막대와 단추 셋 사이) 한가운데에 바다를 품은 유리 물방울 하나(3D 오브제, 멈춘 한 장).
 * 바다의 위젯은 판과 글만 두므로 모퉁이 장식은 여전히 없다 — 장식은 이 물방울 하나뿐이고, 글 위에는 오지 않는다.
 * 위젯 창은 투명 창이라 끝없이 다시 그리면 깜빡인다 — 오브제 무대가 /widget 에서는 한 장만 그리고 맥락도 곧 돌려준다.
 * 잠그면 머리 줄이 사라지고 그 자리를 내용이 쓰므로 함께 사라진다.
 */
import Objet from "@/components/objet/Objet";
import * as S from "./OceanWidgetCharm.styles";

const DROP = { still: true };

export default function OceanWidgetCharm({ locked = false }: { locked?: boolean }) {
    if (locked) return null;
    return (
        <S.Jewel aria-hidden="true">
            <Objet name="ocean/drop" size="100%" options={DROP} interaction="none" />
        </S.Jewel>
    );
}
