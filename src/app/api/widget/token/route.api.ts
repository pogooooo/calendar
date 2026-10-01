import { NextResponse } from "next/server";
import { getUserId } from "@/lib/apiAuth";
import { generateWidgetToken } from "@/lib/jwt";

/**
 * 홈 위젯 전용 열쇠를 내준다 (안드로이드 앱이 위젯 재료를 쓸 때 받아 같이 넣어 둔다).
 * 이 열쇠로는 할 일 넣기(/api/widget/todo)만 된다 — src/lib/jwt.ts 의 generateWidgetToken.
 */
export const POST = async (request: Request) => {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
    const token = await generateWidgetToken(userId);
    return NextResponse.json({ token });
};
