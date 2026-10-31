/** Values are wall-clock inputs in the user's chosen time zone. Only untouched new defaults change. */
export function allDayToggleEnd(start:string,end:string,initial:{start:string;end:string},checked:boolean,editing:boolean):string {
    if(editing || !initial.start || !initial.end || start!==initial.start) return end;
    const singleDayEnd=`${start.slice(0,10)}T${initial.end.slice(11)}`;
    if(checked && end===initial.end) return singleDayEnd;
    if(!checked && end===singleDayEnd) return initial.end;
    return end;
}
