import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/lib/presentationMotion.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const module={exports:{}};
vm.runInNewContext(code,{exports:module.exports,module});
const {resolveThemeMotion}=module.exports;
let checked=0;
for(const requested of ['full','gentle','off'])for(const mobile of [true,false])for(const os of [true,false])for(const override of [true,false]) {
    const actual=resolveThemeMotion(requested,mobile,os,override);
    const expected=os&&!override?'off':mobile&&requested==='full'?'gentle':requested;
    assert.equal(actual,expected);checked++;
}
assert.equal(resolveThemeMotion('full',false,false,false),'full','A narrow website keeps rich motion policy.');
assert.equal(resolveThemeMotion('full',true,false,true),'gentle','Mobile full stays within the mobile interaction budget.');
console.log(`${checked} platform / motion / OS preference combinations passed.`);
