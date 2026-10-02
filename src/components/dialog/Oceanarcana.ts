import type { Arcanum, DialogKind } from './arcana';
export const ARCANA: Record<DialogKind, Arcanum> = {
    info: { num:'I', name:'A message in a bottle' },
    confirm: { num:'II', name:'Choose your shore' },
    danger: { num:'III', name:'Changing tides' },
    ok: { num:'IV', name:'A pearl collected' },
};
