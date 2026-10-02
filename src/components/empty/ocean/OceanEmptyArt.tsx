import type { EmptyArtKind } from '../EmptyArt';
import Seashell from '@/assets/ocean/Seashell';
import * as S from './OceanEmptyArt.styles';
export default function OceanEmptyArt({kind}: {kind:EmptyArtKind}) { return <S.Art data-empty-art={kind}><Seashell /></S.Art>; }
