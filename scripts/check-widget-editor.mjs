/** Widget credentials, authorized CRUD, recurrence and timezone regressions. No account or network. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const cache = new Map();
const category = { id:'mine', name:'할 일', color:'#123456' };
let tokenVersion = 2, sessions = 1, allowed = true, categoryAllowed = true;
let writes = 0;
const todos = new Map();
const completions = new Map();
const full = todo => ({...todo, completions:[...completions.values()].filter(c => c.todoId === todo.id)});
const db = {
    user:{ findUnique:async () => ({tokenVersion}) },
    refreshToken:{ count:async () => sessions },
    category:{ findFirst:async args => categoryAllowed && (!args.where.id || args.where.id === category.id) ? category : null, findMany:async () => [category] },
    todo:{
        findUnique:async ({where}) => todos.get(where.id) ?? null,
        findFirst:async ({where}) => { const todo = todos.get(where.id); return todo?.categoryId === category.id ? full(todo) : null; },
        findMany:async ({where}) => [...todos.values()].filter(todo => where.categoryId.in.includes(todo.categoryId)).map(full),
        create:async ({data}) => { if(data.id && todos.has(data.id)) throw {code:'P2002'}; writes++; const todo={id:`new-${writes}`,...data}; todos.set(todo.id,todo); return full(todo); },
        update:async ({where,data}) => { writes++; const todo={...todos.get(where.id),...data}; todos.set(todo.id,todo); return full(todo); },
        delete:async ({where}) => { writes++; todos.delete(where.id); },
    },
    todoCompletion:{
        findFirst:async ({where}) => completions.get(where.todoId+'@'+where.targetDate.toISOString()) ?? null,
        create:async ({data}) => { writes++; completions.set(data.todoId+'@'+data.targetDate.toISOString(), data); return data; },
        deleteMany:async ({where}) => { writes++; completions.delete(where.todoId+'@'+where.targetDate.toISOString()); },
    },
};
function sourceModule(relative) {
    const filename = path.resolve(relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = {exports:{}}; cache.set(filename,loadedModule);
    const code = ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
    function localRequire(id) {
        if (id === '@/lib/prisma' || id === './prisma') return {default:db,isUniqueViolation:e=>e?.code==='P2002'};
        if (id === './jwt' || id === '@/lib/jwt') return {
            verifyWidgetToken:async token => token === 'widget' ? {userId:'owner',version:2} : null,
            verifyToken:async token => token === 'access-token' ? {userId:'owner'} : null,
        };
        if (id === './rateLimiter') return {checkRateLimit:async () => ({allowed})};
        if (id === '@/store/useSettingStore') return {default:{getState:()=>({timezone:'Asia/Seoul'})}};
        if (id.startsWith('@/') || id.startsWith('.')) {
            const base = id.startsWith('@/') ? path.resolve('src',id.slice(2)) : path.resolve(path.dirname(filename),id);
            const resolved = [base,base+'.ts',base+'.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
            if (resolved) return sourceModule(resolved);
        }
        return require(id);
    }
    new Function('require','module','exports',code)(localRequire,loadedModule,loadedModule.exports);
    return loadedModule.exports;
}
const api = sourceModule('src/app/api/widget/todo/route.api.ts');
const request = (method,body,query='',token='widget') => new Request('https://local.invalid/api/widget/todo'+query,{method,headers:{Authorization:'Bearer '+token},...(body === undefined ? {} : {body:typeof body === 'string' ? body : JSON.stringify(body)})});
const call = (method,body,query,token) => api[method](request(method,body,query,token));
for (const method of ['GET','POST','PATCH','DELETE']) {
    assert.equal((await call(method,undefined,'','access-token')).status,401,'Normal account tokens cannot impersonate widget scope');
    tokenVersion=3; assert.equal((await call(method)).status,401,'Revoked widget credentials must fail'); tokenVersion=2;
    sessions=0; assert.equal((await call(method)).status,401,'A logged-out account cannot use widget credentials'); sessions=1;
    allowed=false; assert.equal((await call(method)).status,429); allowed=true;
}
assert.equal(writes,0);
const normalApi = sourceModule('src/app/api/todo/route.api.ts');
assert.equal((await normalApi.GET(request('GET',undefined,'','widget'))).status,401,'Widget keys cannot reach the regular app API');
assert.equal((await normalApi.GET(request('GET',undefined,'','access-token'))).status,200,'The app API retains its normal access-token authentication');
for (const query of ['?timeZone=invalid','?date=2026-02-30','?date=2026-13-99','?date=bad']) assert.equal((await call('GET',undefined,query)).status,400);
assert.equal((await call('POST','{')).status,400);
assert.equal((await call('POST',{title:'Private',categoryId:'other'})).status,403);
const body={title:'위젯에서 추가',categoryId:'mine',memo:'메모',startAt:'2026-10-27T00:00:00+09:00',endAt:'2026-10-27T23:59:59+09:00',isAllDay:true};
assert.equal((await call('POST',{...body,endAt:'2026-10-26T00:00:00+09:00'})).status,400);
const created=await (await call('POST',body)).json();
const retryBody={...body,requestId:'a1111111-1111-4111-8111-111111111111'};
const retryFirst=await (await call('POST',retryBody)).json();
const beforeRetry=writes;
const retrySecond=await (await call('POST',retryBody)).json();
assert.equal(retryFirst.id,retrySecond.id,'A retry after an ambiguous timeout returns the same todo');
assert.equal(writes,beforeRetry,'Retries do not insert another row');
assert.equal((await call('POST',{...retryBody,title:'different'})).status,409,'A retry key cannot silently overwrite a different draft');
categoryAllowed=false;
assert.equal((await call('POST',retryBody)).status,403,'Retrying never bypasses revoked category permission');
categoryAllowed=true;
assert.equal((await call('POST',{...body,requestId:'invalid'})).status,400);
await call('DELETE',undefined,'?id='+retryFirst.id);
const concurrentBody={...body,requestId:'b2222222-2222-4222-8222-222222222222'};
const concurrentWrites=writes;
const concurrent=await Promise.all([call('POST',concurrentBody),call('POST',concurrentBody)]);
assert.deepEqual(concurrent.map(r=>r.status),[200,200]);
const concurrentRows=await Promise.all(concurrent.map(r=>r.json()));
assert.equal(concurrentRows[0].id,concurrentRows[1].id);
assert.equal(writes,concurrentWrites+1,'Concurrent retries create exactly one row');
await call('DELETE',undefined,'?id='+concurrentRows[0].id);
assert.equal(created.title,body.title);
assert.equal((await call('PATCH',{id:created.id,title:'수정',memo:'새 메모'})).status,200);
assert.equal(todos.get(created.id).title,'수정');
assert.equal(todos.get(created.id).isAllDay,true,'Omitted fields must survive edits');
todos.set('private',{...todos.get(created.id),id:'private',categoryId:'other'});
assert.equal((await call('GET',undefined,'?id=private')).status,404);
assert.equal((await call('PATCH',{id:'private',title:'bad'})).status,403);
assert.equal((await call('PATCH',{id:'private',targetDate:'2026-10-27',completed:true})).status,403);
assert.equal((await call('DELETE',undefined,'?id=private')).status,403);
assert.equal((await call('PATCH',{id:created.id,categoryId:'other'})).status,403);
assert.equal((await call('PATCH',{id:created.id,targetDate:'2026-10-27'})).status,400,'Widget completion requires desired state, never a blind toggle');
for (let i=0;i<2;i++) assert.equal((await call('PATCH',{id:created.id,targetDate:'2026-10-27',completed:true})).status,200);
assert.equal(completions.size,1,'Repeated completion requests are idempotent');
const day=await (await call('GET',undefined,'?date=2026-10-27&timeZone=Asia%2FSeoul')).json();
assert.equal(day.items.length,1); assert.equal(day.items[0].done,true);
assert.deepEqual(day.items[0].doneKeys,['2026-10-27']);
assert.equal(day.items[0].completionDate,'2026-10-27');
assert.deepEqual(day.categories,[category]);
await call('PATCH',{id:created.id,targetDate:'2026-10-27',completed:false});
assert.equal(completions.size,0);
todos.set('repeat',{...todos.get(created.id),id:'repeat',repeat:1,repeatCount:3,excludedDates:'[]'});
await call('PATCH',{id:'repeat',title:'반복 일정 내용 수정'});
assert.equal(todos.get('repeat').repeat,1); assert.equal(todos.get('repeat').repeatCount,3);
await call('DELETE',undefined,'?id=repeat&targetDate=2026-10-28');
assert.ok(todos.has('repeat'),'Deleting an occurrence preserves the series');
assert.deepEqual(JSON.parse(todos.get('repeat').excludedDates),['2026-10-28']);
assert.equal((await call('DELETE',undefined,'?id=repeat&targetDate=2026-02-30')).status,400);
const repeatDay=await (await call('GET',undefined,'?date=2026-10-28')).json();
assert.equal(repeatDay.items.length,0,'Excluded repeat occurrences must not reappear');
await call('DELETE',undefined,'?id='+created.id); assert.ok(!todos.has(created.id));

const {widgetTodos}=sourceModule('src/lib/widgetTodoProjection.ts');
const midnight={id:'midnight',title:'자정에 끝남',categoryId:'mine',startAt:'2026-10-26T23:00:00+09:00',endAt:'2026-10-27T00:00:00+09:00',repeat:0,completions:[]};
assert.equal(widgetTodos([midnight],[category],new Date('2026-10-27T00:00:00+09:00'),new Date('2026-10-27T23:59:59.999+09:00'),'Asia/Seoul').length,0,'An exclusive midnight end does not occupy the following day');
assert.equal(widgetTodos([{...midnight,id:'midnight-repeat',repeat:1,repeatCount:1}],[category],new Date('2026-10-27T00:00:00+09:00'),new Date('2026-10-27T23:59:59.999+09:00'),'Asia/Seoul').length,0,'Repeating occurrences obey the same midnight boundary');
const base={id:'dst',title:'DST',categoryId:'mine',startAt:'2026-03-07T09:00:00-08:00',endAt:'2026-03-07T10:00:00-08:00',repeat:1,repeatCount:3,isAllDay:false,completions:[]};
const instances=widgetTodos([base],[category],new Date('2026-03-07T00:00:00-08:00'),new Date('2026-03-10T00:00:00-07:00'),'America/Los_Angeles');
assert.deepEqual(instances.map(t=>t.startAt),['2026-03-07T17:00:00.000Z','2026-03-08T16:00:00.000Z','2026-03-09T16:00:00.000Z']);
assert.deepEqual(instances.map(t=>t.id),['dst','dst','dst']);
assert.deepEqual(instances.map(t=>t.completionDate),['2026-03-07','2026-03-08','2026-03-09']);
const multi={...base,id:'multi',repeat:0,startAt:'2026-03-07T23:00:00-08:00',endAt:'2026-03-09T10:00:00-07:00',completions:[{targetDate:'2026-03-08T00:00:00.000Z'}]};
const projected=widgetTodos([multi],[category],new Date('2026-03-08T00:00:00-08:00'),new Date('2026-03-09T23:00:00-07:00'),'America/Los_Angeles')[0];
assert.equal(projected.done,true); assert.deepEqual(projected.doneKeys,['2026-03-08']);
console.log('Widget editor authorization, CRUD, idempotent completion, recurring deletion, snapshot refresh and DST checks passed.');
