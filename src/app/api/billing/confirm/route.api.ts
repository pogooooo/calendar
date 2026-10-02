import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { matchesReceipt } from '@/lib/billing/catalog';
import { billingConfig, billingUser, nativeAndroid, tossRequest } from '@/lib/billing/server';

export async function POST(request:NextRequest) {
    const userId = await billingUser(request);
    if (!userId) return NextResponse.json({message:'로그인이 필요합니다.'},{status:401});
    if (nativeAndroid(request)) return NextResponse.json({message:'Google Play 구매를 사용해 주세요.'},{status:403});
    const config = billingConfig();
    if (!config.enabled || !config.secretKey) return NextResponse.json({message:'테스트 결제가 비활성화되어 있습니다.'},{status:503});
    const data = await request.json().catch(()=>null);
    if (typeof data?.orderId !== 'string' || typeof data?.paymentKey !== 'string' || data.paymentKey.length>200 ||
        !/^[\w-]{6,64}$/.test(data.orderId) || !Number.isSafeInteger(data.amount)) {
        return NextResponse.json({message:'결제 정보를 확인해 주세요.'},{status:400});
    }
    const order = await prisma.themeOrder.findUnique({where:{id:data.orderId}});
    if (!order || order.userId !== userId || order.environment !== 'test') return NextResponse.json({message:'주문을 찾을 수 없습니다.'},{status:404});
    if (order.amount !== data.amount) return NextResponse.json({message:'주문 금액이 일치하지 않습니다.'},{status:400});
    if (order.status === 'DONE') {
        if (order.paymentKey !== data.paymentKey) return NextResponse.json({message:'결제 정보가 일치하지 않습니다.'},{status:409});
        return NextResponse.json({testPurchased:true,themeId:order.themeId});
    }
    if (Date.now()-order.createdAt.getTime()>24*60*60*1000) return NextResponse.json({message:'주문이 만료되었습니다. 다시 시작해 주세요.'},{status:410});
    try {
        let receipt = await tossRequest('confirm',config.secretKey,{method:'POST',headers:{'Idempotency-Key':order.id},
            body:JSON.stringify({orderId:order.id,paymentKey:data.paymentKey,amount:order.amount})}).catch(()=>null);
        // Network retries or duplicate callbacks can follow an already approved payment.
        if (!receipt) receipt = await tossRequest(encodeURIComponent(data.paymentKey),config.secretKey).catch(()=>null);
        if (!receipt || !matchesReceipt(receipt,order,data.paymentKey)) return NextResponse.json({message:'승인 결과를 확인하지 못했습니다. 잠시 후 다시 확인해 주세요.'},{status:502});
        await prisma.themeOrder.update({where:{id:order.id},data:{status:'DONE',paymentKey:data.paymentKey,confirmedAt:new Date()}});
        return NextResponse.json({testPurchased:true,themeId:order.themeId});
    } catch {
        return NextResponse.json({message:'구매 기록을 저장하지 못했습니다. 다시 확인해 주세요.'},{status:503});
    }
}
