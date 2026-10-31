/** Responder embeds must never expose edit/response URLs or claim automatic enrollment. No Google writes. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const loaded = {exports:{}};
const code = ts.transpileModule(fs.readFileSync('src/lib/androidTesting.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
new Function('exports',code)(loaded.exports);
const {androidTestingUrl,ANDROID_TEST_FORM_URL,ANDROID_TEST_FORM_EMBED_URL}=loaded.exports;
const form=new URL(ANDROID_TEST_FORM_URL);
assert.equal(form.protocol,'https:');
assert.equal(form.hostname,'docs.google.com');
assert.match(form.pathname,/^\/forms\/d\/e\/[^/]+\/viewform$/);
assert.equal(form.search,'');
const embed=new URL(ANDROID_TEST_FORM_EMBED_URL);
assert.equal(embed.origin,form.origin);
assert.equal(embed.pathname,form.pathname);
assert.equal(embed.searchParams.get('embedded'),'true');
for(const target of ['test','store']) {
    const url = new URL(androidTestingUrl(target,' Person+beta@Example.com '));
    assert.equal(url.protocol,'https:');
    assert.equal(url.searchParams.get('authuser'),'person+beta@example.com');
    assert.equal(url.hostname,'play.google.com');
    assert.equal(new URL(androidTestingUrl(target,'invalid')).searchParams.has('authuser'),false);
    assert.equal(new URL(androidTestingUrl(target,'a'.repeat(255)+'@example.com')).searchParams.has('authuser'),false);
    assert.equal(new URL(androidTestingUrl(target,'a@b.com\r\nInjected: value')).searchParams.has('authuser'),false);
}
assert.equal(new URL(androidTestingUrl('store','a@b.com')).searchParams.get('id'),'com.cronos.todoapp');
assert.equal(new URL(androidTestingUrl('test','a@b.com')).pathname,'/apps/testing/com.cronos.todoapp');
console.log('Android manual application: public responder/embed routes, Play account handoff, package identity and email validation passed.');
