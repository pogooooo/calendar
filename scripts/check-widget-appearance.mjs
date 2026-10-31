import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function load(file,overrides={}){const loaded={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;new Function('require','module','exports','window',code)(id=>overrides[id]??require(id),loaded,loaded.exports,{addEventListener(){}});return loaded.exports;}
const appearance=load('src/lib/widgetAppearance.ts');
const background=load('src/lib/widgetBackground.ts');
const {normalizeWidgetBackground:normalizeBg,widgetBackgroundStyle:backgroundStyle}=background;
const {normalizeWidgetAppearance:normalize,resolveWidgetEffect:effect}=appearance;
assert.deepEqual(normalize(),{design:'ornate',intensity:1,effect:'inherit'});
assert.deepEqual(normalize({design:'invalid',intensity:Infinity,effect:'invalid'}),normalize());
assert.equal(normalize({intensity:-1}).intensity,0);assert.equal(normalize({intensity:2}).intensity,1);
for(const app of ['full','gentle','off'])for(const local of ['inherit','full','gentle','off']){
 const result=effect(app,local);
 assert.equal(result,app==='off'||local==='off'?'off':local==='inherit'?app:app==='gentle'?'gentle':local);
}
const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
const records=new Map();
Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>records.get(k)??null,setItem:(k,v)=>records.set(k,v),removeItem:k=>records.delete(k)}});
const open=()=>load('src/store/useWidgetStore.ts',{'@/lib/widgetAppearance':appearance,'@/lib/widgetBackground':background}).default;
try{
 const original=open();
 original.getState().updateBg('monthly',{mode:'custom',opacity:.37,customColor:'#123456',gloss:true});
 // An existing installation has no appearance object. It must retain all old fields.
 const legacy=JSON.parse(records.get('cronos-widget-settings'));delete legacy.state.monthly.appearance;
 records.set('cronos-widget-settings',JSON.stringify(legacy));
 const migrated=open();assert.equal(migrated.getState().monthly.bg.customColor,'#123456');
 migrated.getState().updateAppearance('monthly',{design:'simple',effect:'off',intensity:.25});
 const reopened=open();
 assert.deepEqual(normalize(reopened.getState().monthly.appearance),{design:'simple',effect:'off',intensity:.25});
 assert.deepEqual(reopened.getState().monthly.bg,{...legacy.state.monthly.bg});
 assert.equal(normalize(reopened.getState().today.appearance).design,'ornate','Kinds must remain independent');
 reopened.getState().updateAppearance('today',{effect:'gentle'});
 assert.equal(reopened.getState().monthly.appearance.effect,'off');
 // Fully clear backgrounds must not fade ornaments or text. Changes stay per kind.
 reopened.getState().updateBg('monthly',{opacity:0});
 assert.equal(reopened.getState().monthly.appearance.intensity,.25);
 reopened.getState().updateAppearance('monthly',{intensity:1});
 assert.equal(reopened.getState().monthly.bg.opacity,0);
 assert.equal(open().getState().monthly.bg.opacity,0);
 assert.equal(open().getState().monthly.appearance.intensity,1);
 assert.equal(reopened.getState().today.bg.opacity,.92);
 for(const mode of ['theme','custom','glass']) {
   const bg=normalizeBg({...legacy.state.monthly.bg,mode,opacity:0,glassBlur:18});
   assert.equal(backgroundStyle(bg,'#112233').opacity,0);
   assert.equal(bg.glassBlur,18);
 }
 const oldGlass={...legacy.state.monthly.bg,mode:'glass',opacity:.37};delete oldGlass.glassBlur;
 const restored=normalizeBg(oldGlass);
 assert.equal(restored.opacity,1);assert.equal(restored.glassBlur,.37*40);
 assert.deepEqual(normalizeBg(restored),restored,'Glass migration must happen only once');
 reopened.getState().updateBg('monthly',{...oldGlass,glassBlur:undefined});
 reopened.getState().updateBg('monthly',{opacity:0});
 assert.equal(open().getState().monthly.bg.opacity,0);
 assert.equal(open().getState().monthly.bg.glassBlur,.37*40);
 assert.equal(records.size,1,'Desktop appearance must not write app or Android preferences');
 console.log('Desktop widget appearance: independent backdrop/ornament opacity, glass blur migration, per-widget persistence and motion caps passed.');
}finally{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else delete globalThis.localStorage;}
