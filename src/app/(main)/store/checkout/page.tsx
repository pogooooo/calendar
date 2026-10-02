"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { isMobileShell, isDesktopShell } from '@/lib/platform';
import { isBillingTheme } from '@/lib/billing/catalog';
import { loadTossScript, type TossWidgets } from '@/lib/billing/tossClient';
import * as S from '@/components/billing/ThemeShop.styles';

interface Order {orderId:string;customerKey:string;orderName:string;amount:number;clientKey:string;}
export default function ThemeCheckout() {
    const authFetch=useAuthFetch();
    const [message,setMessage]=useState('테스트 구매를 준비하고 있습니다.');
    const [order,setOrder]=useState<Order|null>(null);
    const [ready,setReady]=useState(false);
    const [agreed,setAgreed]=useState(false);
    const [busy,setBusy]=useState(false);
    const [result,setResult]=useState('');
    const widgets=useRef<TossWidgets|null>(null);
    const started=useRef(false);
    const confirm=useCallback(async()=>{
        const params=new URLSearchParams(window.location.search);
        setBusy(true);
        try {
            const res=await authFetch('/api/billing/confirm',{method:'POST',headers:{'Content-Type':'application/json'},
                body:JSON.stringify({orderId:params.get('orderId'),paymentKey:params.get('paymentKey'),amount:Number(params.get('amount'))})});
            const data=await res.json();
            if(!res.ok) throw new Error(data.message);
            setMessage('테스트 구매가 완료되었습니다. 실결제와 실제 테마 구매 권한은 발생하지 않습니다.');
            setResult('complete');
            // Keep provider identifiers out of browser history after successful confirmation.
            window.history.replaceState(null,'','/store/checkout?result=complete');
        } catch(err) { setMessage(err instanceof Error?err.message:'승인 결과를 확인하지 못했습니다.'); }
        finally {setBusy(false);}
    },[authFetch]);
    useEffect(()=>{
        if(started.current) return;
        started.current=true;
        if(isMobileShell()) {setMessage('앱 구매에는 Google Play 결제 연동이 필요합니다.');return;}
        if(isDesktopShell()) {setMessage('테스트 결제는 웹 버전에서 확인할 수 있습니다. 데스크탑 구매 연결은 상점 등록 후 준비됩니다.');return;}
        const params=new URLSearchParams(window.location.search);
        setResult(params.get('result') ?? '');
        if(params.get('result')==='success') {void confirm();return;}
        if(params.get('result')==='complete') {setMessage('테스트 구매를 완료했습니다.');return;}
        if(params.get('result')==='fail') {setMessage(params.get('code')==='PAY_PROCESS_CANCELED'?'결제를 취소했습니다. 비용은 청구되지 않았습니다.':'결제를 완료하지 못했습니다. 설정에서 다시 시작할 수 있습니다.');return;}
        const themeId=params.get('theme');
        if(!isBillingTheme(themeId)) {setMessage('설정에서 구매할 테마를 선택해 주세요.');return;}
        authFetch('/api/billing/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({themeId})})
            .then(async res=>{const data=await res.json();if(!res.ok)throw new Error(data.message);setOrder(data);setMessage('테스트 결제입니다. 실제 금액은 청구되지 않습니다.');})
            .catch(err=>setMessage(err instanceof Error?err.message:'주문을 준비하지 못했습니다.'));
    },[authFetch,confirm]);
    useEffect(()=>{
        if(!order) return;
        let stopped=false;
        const resources:{destroy():Promise<void>}[]=[];
        const track=async(resource:{destroy():Promise<void>})=>{if(stopped) await resource.destroy();else resources.push(resource);};
        async function setup() {
            await loadTossScript();
            if(stopped || !window.TossPayments || !order) return;
            const instance=window.TossPayments(order.clientKey).widgets({customerKey:order.customerKey});
            widgets.current=instance;
            await instance.setAmount({value:order.amount,currency:'KRW'});
            if(stopped) return;
            await track(await instance.renderPaymentMethods({selector:'#theme-payment-methods',variantKey:'DEFAULT'}));
            if(stopped) return;
            const agreement=await instance.renderAgreement({selector:'#theme-payment-agreement',variantKey:'AGREEMENT'});
            agreement.on('agreementStatusChange',state=>{if(!stopped) setAgreed(state.agreedRequiredTerms);});
            await track(agreement);
            if(!stopped) setReady(true);
        }
        void setup().catch(()=>{if(!stopped) setMessage('결제 서비스를 불러오지 못했습니다. 상점 테스트 설정을 확인해 주세요.');});
        return ()=>{stopped=true;widgets.current=null;resources.forEach(r=>{void r.destroy().catch(()=>{});});};
    },[order]);
    const pay=async()=>{
        if(!ready || !agreed || !order || !widgets.current) return;
        setBusy(true);
        try {await widgets.current.requestPayment({orderId:order.orderId,orderName:order.orderName,
            successUrl:`${window.location.origin}/store/checkout?result=success`,failUrl:`${window.location.origin}/store/checkout?result=fail`});}
        catch {setMessage('결제를 중단했습니다. 다시 시도할 수 있습니다.');setBusy(false);}
    };
    return <S.Checkout><h1>테마 테스트 구매</h1><p role="status">{message}</p>
        {order && <><p>{order.orderName} · {order.amount.toLocaleString()}원</p><div id="theme-payment-methods" /><div id="theme-payment-agreement" /><button disabled={!ready || !agreed || busy} onClick={()=>void pay()}>{busy?'확인 중…':'테스트 결제하기'}</button></>}
        {!order && result==='success' && <button disabled={busy} onClick={()=>void confirm()}>승인 결과 다시 확인</button>}
        <p><Link href="/settings">설정으로 돌아가기</Link></p>
    </S.Checkout>;
}
