import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isBillingTheme, THEME_NAMES } from '@/lib/billing/catalog';
import { billingConfig, billingUser, nativeAndroid } from '@/lib/billing/server';

export async function POST(request:NextRequest) {
    const userId = await billingUser(request);
    if (!userId) return NextResponse.json({message:'로그인이 필요합니다.'},{status:401});
    if (nativeAndroid(request)) return NextResponse.json({message:'앱 구매에는 Google Play 결제 연동이 필요합니다.'},{status:403});
    const config = billingConfig();
    if (!config.enabled) return NextResponse.json({message:'테스트 결제 설정이 아직 준비되지 않았습니다.'},{status:503});
    const data = await request.json().catch(()=>null);
    const themeId:unknown = data?.themeId;
    if (!isBillingTheme(themeId)) return NextResponse.json({message:'테마를 확인해 주세요.'},{status:400});
    const amount = config.prices[themeId];
    if (!amount) return NextResponse.json({message:'가격이 아직 정해지지 않았습니다.'},{status:409});
    const prior = await prisma.themeOrder.findFirst({where:{userId,themeId,status:'DONE',environment:'test'}});
    if (prior) return NextResponse.json({message:'이미 테스트 구매를 완료한 테마입니다.'},{status:409});
    const order = await prisma.themeOrder.create({data:{id:crypto.randomUUID(),userId,themeId,amount,customerKey:crypto.randomUUID()}});
    return NextResponse.json({orderId:order.id,customerKey:order.customerKey,amount,orderName:`CRONOS ${THEME_NAMES[themeId]} 테마 · 테스트`,clientKey:config.clientKey},
        {headers:{'Cache-Control':'private, no-store'}});
}
