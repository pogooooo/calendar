"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { isMobileShell, isDesktopShell } from '@/lib/platform';
import { BILLING_THEMES, THEME_NAMES, type BillingTheme } from '@/lib/billing/catalog';
import * as S from './ThemeShop.styles';

interface Catalog { enabled:boolean; items:{id:BillingTheme;amount:number|null;testPurchased:boolean}[]; }
export default function ThemeShop({locale}: {locale:string}) {
    const authFetch = useAuthFetch();
    const router = useRouter();
    const [catalog,setCatalog] = useState<Catalog|null>(null);
    const [state,setState] = useState<'loading'|'ready'|'error'>('loading');
    const ko = locale === 'ko';
    const [native,setNative] = useState(false);
    const [desktop,setDesktop] = useState(false);
    useEffect(()=>{
        let active=true;
        setNative(isMobileShell()); setDesktop(isDesktopShell());
        authFetch('/api/billing/catalog',{headers:isMobileShell()?{'X-Cronos-Platform':'android'}:{}}).then(async res=>{
            if (!res.ok) throw new Error('catalog');
            const value = await res.json();
            if (active) { setCatalog(value); setState('ready'); }
        }).catch(()=>{ if(active) setState('error'); });
        return ()=>{active=false;};
    },[authFetch]);
    return <S.Shop aria-label={ko?'테마 구매':'Theme purchases'}>
        <h2>{ko?'테마별 1회 구매 · 준비 중':'One-time theme purchases · In preparation'}</h2>
        <p>{native
            ? (ko?'앱 구매는 Google Play 결제 연동 후 제공됩니다. 현재 테마는 계속 사용할 수 있습니다.':'App purchases will follow Google Play billing integration. Current themes remain available.')
            : (ko?'현재는 실결제가 없는 테스트 준비 단계입니다. 기존 테마의 사용 권한은 그대로 유지됩니다.':'Sandbox setup only; no real charges. Current theme access is preserved.')}</p>
        {state==='error' && <p role="status">{ko?'구매 정보를 불러오지 못했습니다. 테마 선택은 계속 사용할 수 있습니다.':'Purchase details could not load. Theme selection is still available.'}</p>}
        <S.Cards>{BILLING_THEMES.map(id=>{
            const item=catalog?.items.find(x=>x.id===id);
            const available=!!catalog?.enabled && !!item?.amount && !item.testPurchased && !native && !desktop;
            return <S.Card key={id}><strong>{THEME_NAMES[id]}</strong>
                <span>{item?.testPurchased?(ko?'테스트 구매 완료':'Sandbox purchase complete'):item?.amount?`${item.amount.toLocaleString()} KRW · ${ko?'테스트':'Test'}`:(ko?'가격 미정':'Price to be decided')}</span>
                <button type="button" disabled={!available} onClick={()=>router.push(`/store/checkout?theme=${id}`)}>
                    {state==='loading'?(ko?'확인 중…':'Checking…'):available?(ko?'테스트 구매':'Test purchase'):(ko?'판매 준비 중':'Preparing sales')}
                </button>
            </S.Card>;
        })}</S.Cards>
    </S.Shop>;
}
