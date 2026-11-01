import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const testModule={exports:{}};
new Function('exports','module',ts.transpileModule(fs.readFileSync('src/lib/projectTimelineLayout.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(testModule.exports,testModule);
const {packTimelineRows,calendarDayNumber}=testModule.exports;
const sample=[{id:'1',start:3,end:4},{id:'2',start:3,end:5},{id:'3',start:4,end:6},...Array.from({length:9},(_,i)=>({id:String(i+4),start:9+i*2,end:10+i*2})),{id:'13',start:6,end:8}];
const packed=packTimelineRows(sample);
assert.equal(packed.rowCount,3);
assert.equal(packed.rows.get('1'),packed.rows.get('13'),'Non-overlapping tasks 1 and 13 share a row');
assert.deepEqual(packTimelineRows([...sample].reverse()),packed,'Input ordering does not change placement');
assert.equal(packTimelineRows([]).rowCount,0);
assert.equal(packTimelineRows([{id:'a',start:1,end:1},{id:'b',start:1,end:1}]).rowCount,2,'Same-day intervals overlap');
assert.equal(packTimelineRows([{id:'a',start:1,end:2},{id:'b',start:3,end:3}]).rowCount,1);
const dense=Array.from({length:160},(_,i)=>({id:String(i),start:(i*17)%47,end:(i*17)%47+i%9}));
const layout=packTimelineRows(dense);
let maximum=0;
for(let day=0;day<60;day++)maximum=Math.max(maximum,dense.filter(t=>t.start<=day&&t.end>=day).length);
assert.equal(layout.rowCount,maximum,'Row count equals maximum simultaneous overlap');
for(const a of dense)for(const b of dense)if(a.id!==b.id&&layout.rows.get(a.id)===layout.rows.get(b.id))assert.ok(a.end<b.start||b.end<a.start);
const oldZone=process.env.TZ;
try{
    process.env.TZ='America/New_York';
    assert.equal(calendarDayNumber(new Date(2026,2,9))-calendarDayNumber(new Date(2026,2,7)),2,'Spring DST does not shift columns');
    assert.equal(calendarDayNumber(new Date(2026,10,2))-calendarDayNumber(new Date(2026,9,31)),2,'Fall DST does not shift columns');
}finally{if(oldZone===undefined)delete process.env.TZ;else process.env.TZ=oldZone;}
console.log('Project timeline: compact rows, same-day overlap, stable placement, dense schedules and DST columns passed.');
