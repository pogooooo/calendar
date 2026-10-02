import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BILLING_THEMES, THEME_NAMES } from '@/lib/billing/catalog';
import { billingConfig, billingUser, nativeAndroid } from '@/lib/billing/server';

export async function GET(request:NextRequest) {
    const config = billingConfig();
    const android = nativeAndroid(request);
    const userId = await billingUser(request);
    // Disabled setup must also work before the database migration has been applied.
    const purchased = config.enabled && userId ? await prisma.themeOrder.findMany({
        where:{userId,status:'DONE',environment:'test'},select:{themeId:true},
    }) : [];
    return NextResponse.json({
        mode:'test', enabled:config.enabled && !android,
        platform:android?'google-play':'web',
        items:BILLING_THEMES.map(id=>({id,name:THEME_NAMES[id],amount:config.prices[id] ?? null,
            testPurchased:purchased.some(x=>x.themeId===id)})),
    },{headers:{'Cache-Control':'private, no-store'}});
}
