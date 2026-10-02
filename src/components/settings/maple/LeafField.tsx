import * as S from "./LeafField.styles";

/** 설정 바탕의 잎 넉 장(B2·B3·B4·B5). 로그인의 도감 한 장과 같은 손으로 그린 것들이다 */
export default function LeafField() {
    return (
        <S.Field aria-hidden="true" data-ambient="maple-leaves">
            {/* eslint-disable @next/next/no-img-element */}
            <img className="a" src="/themes/maple/leaf-red.webp" alt="" draggable={false} />
            <img className="b" src="/themes/maple/leaf-orange.webp" alt="" draggable={false} />
            <img className="c" src="/themes/maple/leaf-yellow.webp" alt="" draggable={false} />
            <img className="d" src="/themes/maple/leaf-brown.webp" alt="" draggable={false} />
            {/* eslint-enable @next/next/no-img-element */}
        </S.Field>
    );
}
