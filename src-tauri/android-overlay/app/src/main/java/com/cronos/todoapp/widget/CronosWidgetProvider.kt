package com.cronos.todoapp.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.TypedValue
import android.widget.RemoteViews
import com.cronos.todoapp.MainActivity
import com.cronos.todoapp.R

/**
 * 위젯 한 종류당 하나씩 상속해서 kind 만 바꾸면 된다.
 * 그림은 앱과 같은 웹 화면을 찍은 것이라 데스크톱 위젯과 생김새가 같다.
 */
abstract class CronosWidgetProvider : AppWidgetProvider() {

    abstract val kind: String

    override fun onUpdate(
        context: Context,
        manager: AppWidgetManager,
        ids: IntArray,
    ) {
        ids.forEach { id -> renderOne(context, manager, id) }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        manager: AppWidgetManager,
        id: Int,
        newOptions: android.os.Bundle,
    ) {
        renderOne(context, manager, id)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        if (intent.action == ACTION_REFRESH) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, javaClass))
            onUpdate(context, manager, ids)
        }
    }

    private fun renderOne(context: Context, manager: AppWidgetManager, id: Int) {
        val views = RemoteViews(context.packageName, R.layout.widget_cronos)

        views.setOnClickPendingIntent(R.id.widget_root, openAppIntent(context))
        manager.updateAppWidget(id, views)

        val options = manager.getAppWidgetOptions(id)
        val dpW = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 200)
        val dpH = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 200)

        val px = { dp: Int ->
            TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                dp.toFloat(),
                context.resources.displayMetrics,
            ).toInt().coerceAtLeast(1)
        }

        val w = px(dpW)
        val h = px(dpH)

        WidgetSnapshot.render(context, "$BASE_URL/widget/$kind/", w, h) { bitmap ->
            if (bitmap == null) return@render

            val out = RemoteViews(context.packageName, R.layout.widget_cronos)
            out.setImageViewBitmap(R.id.widget_image, bitmap)
            out.setOnClickPendingIntent(R.id.widget_root, openAppIntent(context))
            manager.updateAppWidget(id, out)
        }
    }

    private fun openAppIntent(context: Context): PendingIntent {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        return PendingIntent.getActivity(
            context,
            kind.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    companion object {
        const val ACTION_REFRESH = "com.cronos.todoapp.WIDGET_REFRESH"

        /** Tauri 가 내장 자산을 띄우는 주소. 앱과 같은 출처라 로그인 상태를 그대로 쓴다. */
        const val BASE_URL = "http://tauri.localhost"
    }
}

class TodayWidgetProvider : CronosWidgetProvider() {
    override val kind = "today"
}

class NowNextWidgetProvider : CronosWidgetProvider() {
    override val kind = "nownext"
}

class ChallengeWidgetProvider : CronosWidgetProvider() {
    override val kind = "challenge"
}
