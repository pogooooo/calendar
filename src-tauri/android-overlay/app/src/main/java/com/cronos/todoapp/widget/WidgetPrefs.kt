package com.cronos.todoapp.widget

import android.content.Context

/**
 * 위젯 하나하나의 설정 — 놓을 때 WidgetConfigActivity 가 묻고, 길게 눌러 다시 열 수 있다.
 *   alpha: 바탕 불투명도 20..100 (%)
 *   mode: "app"(앱 테마 따라감) | "light" | "dark"
 */
object WidgetPrefs {
    private const val FILE = "cronos_widgets"
    const val DEFAULT_ALPHA = 88

    private fun prefs(context: Context) = context.getSharedPreferences(FILE, Context.MODE_PRIVATE)

    fun alpha(context: Context, id: Int): Int = prefs(context).getInt("alpha_$id", DEFAULT_ALPHA).coerceIn(20, 100)
    fun mode(context: Context, id: Int): String = prefs(context).getString("mode_$id", "app") ?: "app"

    fun save(context: Context, id: Int, alpha: Int, mode: String) {
        prefs(context).edit().putInt("alpha_$id", alpha.coerceIn(20, 100)).putString("mode_$id", mode).apply()
    }

    fun remove(context: Context, ids: IntArray) {
        val e = prefs(context).edit()
        ids.forEach { e.remove("alpha_$it").remove("mode_$it") }
        e.apply()
    }
}
