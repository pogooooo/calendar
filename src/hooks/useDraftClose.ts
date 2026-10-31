"use client";

import { useRef } from 'react';
import { useDialog } from '@/components/dialog/DialogProvider';
import { useT } from '@/i18n/useT';

/** Used by form owners so successful saves can still close immediately. */
export default function useDraftClose(onClose:()=>void, hasChanges:()=>boolean, pending=false) {
    const dialog=useDialog(), t=useT();
    const asking=useRef(false);
    return async()=>{
        if(pending || asking.current) return;
        if(!hasChanges()) {onClose();return;}
        asking.current=true;
        try {
            if(await dialog.confirmDanger({title:t.interaction.discardTitle,message:t.interaction.unsaved,
                confirmLabel:t.interaction.discardClose,cancelLabel:t.interaction.keepWriting})) onClose();
        } finally {asking.current=false;}
    };
}
