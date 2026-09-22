import { resolveIconKey } from "../celestial/AnniversaryIcons";
import * as S from "./MapleAnniversaryIcon.styles";

/** 먹으로 그린 기념일 아이콘(D2). 열쇠는 Celestial 과 같고(star·moon·…), 색은 글자색을 따른다 */
export default function MapleAnniversaryIcon({ name, size = 16 }: { name?: string | null; size?: number; strokeWidth?: number }) {
    return <S.Ink $key={resolveIconKey(name)} $size={size} aria-hidden="true" />;
}
