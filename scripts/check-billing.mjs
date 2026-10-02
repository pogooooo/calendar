import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=fs.readFileSync('src/lib/billing/catalog.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const exports={}; vm.runInNewContext(js,{exports});
const {parsePrices,isTestConfiguration,matchesReceipt,isBillingTheme}=exports;

assert.equal(isBillingTheme('ocean'),true);
assert.equal(isBillingTheme('__proto__'),false);
assert.equal(isBillingTheme('ocean-dark'),false);
assert.equal(Object.keys(parsePrices('invalid')).length,0);
assert.equal(Object.keys(parsePrices('[1,2]')).length,0);
const prices=parsePrices('{"ocean":1000,"maple":-1,"celestial":"1000","unknown":1000}');
assert.equal(prices.ocean,1000);
assert.equal(Object.keys(prices).length,1);
assert.equal(Object.keys(parsePrices('{"ocean":1.5}')).length,0);
assert.equal(Object.keys(parsePrices('{"ocean":9007199254740992}')).length,0);
assert.equal(isTestConfiguration('true','test_public','test_secret'),true);
assert.equal(isTestConfiguration('false','test_public','test_secret'),false);
assert.equal(isTestConfiguration('true','live_public','live_secret'),false);
assert.equal(isTestConfiguration('true','test_public','live_secret'),false);
assert.equal(isTestConfiguration('true','test_public',undefined),false);

const order={id:'order-test',amount:1000};
const receipt={orderId:order.id,paymentKey:'provider-key',status:'DONE',currency:'KRW',totalAmount:1000};
assert.equal(matchesReceipt(receipt,order,'provider-key'),true);
for(const bad of [{totalAmount:1},{orderId:'other-user-order'},{paymentKey:'wrong-key'},{status:'WAITING_FOR_DEPOSIT'},{status:'CANCELED'},{currency:'USD'}]) {
    assert.equal(matchesReceipt({...receipt,...bad},order,'provider-key'),false);
}

// Exercise actual route code with a mocked provider/database. No payment network calls.
let config={enabled:true,clientKey:'test_public',secretKey:'test_secret',prices:{ocean:1000}};
let stored={id:'order-test',userId:'buyer',environment:'test',status:'CREATED',amount:1000,themeId:'ocean',createdAt:new Date(),paymentKey:null};
let receiptResult=receipt;
let providerCalls=0;
let saves=0;
let prior=null;
let providerFailure=false;
const database={themeOrder:{
    findUnique:async()=>stored,
    findFirst:async()=>prior,
    create:async({data})=>{saves++;return data;},
    update:async({data})=>{saves++;stored={...stored,...data};return stored;},
}};
const server={
    billingConfig:()=>config,
    billingUser:async request=>request.owner,
    nativeAndroid:request=>request.android,
    tossRequest:async()=>{providerCalls++;if(providerFailure&&providerCalls%2===1)throw Error('timeout');return receiptResult;},
};
function loadRoute(file) {
    const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
    const route={};
    vm.runInNewContext(output,{exports:route,crypto:{randomUUID:()=> 'random-order-id'},Date,
        require:id=>{
            if(id==='next/server')return {NextResponse:{json:(data,options)=>new Response(JSON.stringify(data),options)}};
            if(id==='@/lib/prisma')return {__esModule:true,default:database};
            if(id==='@/lib/billing/catalog')return exports;
            if(id==='@/lib/billing/server')return server;
            throw Error(`Unexpected import ${id}`);
        },
    });
    return route.POST;
}
const request=(owner='buyer',data={},android=false)=>({owner,android,json:async()=>data});
const createOrder=loadRoute('src/app/api/billing/orders/route.api.ts');
assert.equal((await createOrder(request(null))).status,401);
assert.equal((await createOrder(request('buyer',{themeId:'ocean'},true))).status,403);
config={...config,enabled:false};
assert.equal((await createOrder(request('buyer',{themeId:'ocean'}))).status,503);
config={...config,enabled:true};
assert.equal((await createOrder(request('buyer',{themeId:'maple'}))).status,409);
assert.equal((await createOrder(request('buyer',{themeId:'unknown'}))).status,400);
prior={};assert.equal((await createOrder(request('buyer',{themeId:'ocean'}))).status,409);prior=null;
const created=await createOrder(request('buyer',{themeId:'ocean',amount:1}));
assert.equal(created.status,200);assert.equal((await created.json()).amount,1000); // ignores browser price

const confirmOrder=loadRoute('src/app/api/billing/confirm/route.api.ts');
const valid={orderId:'order-test',paymentKey:'provider-key',amount:1000};
assert.equal((await confirmOrder(request(null,valid))).status,401);
assert.equal((await confirmOrder(request('other-buyer',valid))).status,404);
assert.equal((await confirmOrder(request('buyer',{...valid,amount:1}))).status,400);
assert.equal(providerCalls,0);
stored={...stored,createdAt:new Date(Date.now()-25*60*60*1000)};
assert.equal((await confirmOrder(request('buyer',valid))).status,410);
stored={...stored,createdAt:new Date()};
receiptResult={...receipt,status:'CANCELED'};
assert.equal((await confirmOrder(request('buyer',valid))).status,502);
assert.equal(stored.status,'CREATED');
receiptResult=receipt;providerFailure=true;providerCalls=0;
assert.equal((await confirmOrder(request('buyer',valid))).status,200);
assert.equal(providerCalls,2); // failed confirm recovered through a verified provider query
assert.equal(stored.status,'DONE');
const saved=saves;
assert.equal((await confirmOrder(request('buyer',valid))).status,200);
assert.equal(saves,saved);assert.equal(providerCalls,2); // callback retries are idempotent
assert.equal((await confirmOrder(request('buyer',{...valid,paymentKey:'other-payment'}))).status,409);
console.log('Billing checks passed: prices, test-only keys, ownership, amount tampering, Android block, expiry, duplicate callbacks and provider recovery.');
