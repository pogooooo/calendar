import Seashell from '@/assets/ocean/Seashell';
import { memo } from 'react';
import * as S from './OceanAuthPanel.styles';
export default memo(function OceanAuthPanel({ busy = false }: { busy?: boolean }) { return <S.Panel data-busy={busy}><Seashell /><h1>CRONOS</h1><svg viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true" data-ambient="ocean-auth"><path d="M-150 60q75-25 150 0t150 0t150 0t150 0t150 0v80H-150Z" /><path d="M-150 80q75-25 150 0t150 0t150 0t150 0t150 0v60H-150Z" /></svg></S.Panel>; });
