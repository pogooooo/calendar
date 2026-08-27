package com.cronos.todoapp.widget

import android.content.Context
import android.content.Intent

/**
 * Android 홈 위젯의 자동 갱신 주기는 최소 30분이라 체크 하나 눌러도 한참 뒤에야 반영된다.
 * 앱에서 데이터가 바뀔 때 이 방송을 쏘면 위젯이 곧바로 다시 그려진다.
 */
object WidgetRefresh {

    fun broadcast(context: Context) {
        val providers = listOf(
            TodayWidgetProvider::class.java,
            NowNextWidgetProvider::class.java,
            ChallengeWidgetProvider::class.java,
        )

        providers.forEach { cls ->
            context.sendBroadcast(
                Intent(context, cls).setAction(CronosWidgetProvider.ACTION_REFRESH)
            )
        }
    }
}
