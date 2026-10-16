package com.cronos.todoapp.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.graphics.Bitmap
import java.io.File

/**
 * 개발용: 위젯 고르기 화면의 미리보기 그림(res/drawable-nodpi/widget_preview_*.png)을 만든다.
 * 미리보기는 정적 그림이어야 해서(previewImage) 실제 화가가 견본 자료로 그린 걸 파일로 저장하고 adb 로 가져온다.
 *   adb shell am broadcast -n com.cronos.todoapp/.widget.PreviewRenderReceiver -a com.cronos.todoapp.RENDER_PREVIEWS
 * `--ez live true` 를 붙이면 견본 대신 지금 앱의 스냅샷(widget-snapshot.json)으로 그린다 — 테마 갈래를 눈으로 볼 때.
 * `--es family ocean` 처럼 갈래를 주면 그 갈래의 기본색으로 previews/<갈래>/ 에 그린다 — 세 갈래를 한꺼번에 견줄 때.
 * `--es family maple_vintage` 처럼 갈래 뒤에 _벌을 붙이면 밝은 그림을 그 벌의 색(앱 theme.ts 의 maple-vintage 와 같은 값)으로 그린다.
 * 디버그 빌드에서만 일한다.
 */
class PreviewRenderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val debuggable = (context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
        if (!debuggable) return
        val family = intent.getStringExtra("family")
        // "maple_vintage" → 갈래 maple, 벌 vintage
        val fam = family?.substringBefore("_")
        val vintage = if (family?.substringAfter("_", "") == "vintage") Snapshot.ThemeSpec("maple", "light", mapOf(
            "background" to 0xFFE7DABF.toInt(), "surface" to 0xFFF2E8D3.toInt(), "primary" to 0xFF96452A.toInt(), "accent" to 0xFFBB9150.toInt(),
            "text" to 0xFF38291E.toInt(), "textSecondary" to 0xFF76624C.toInt(), "weekend" to 0xFF9A4A3B.toInt(),
        ), "vintage") else null
        val dir = File(context.filesDir, if (family != null) "previews/$family" else "previews").apply { mkdirs() }
        val live = if (intent.getBooleanExtra("live", false)) Snapshot.load(context) else null
        val snap = live ?: Snapshot.parse(context.assets.open("widget-sample.json").bufferedReader().readText())
        // 견본은 그날(견본의 date) 낮 12:42 에 본 것으로 그린다 — 에뮬레이터 시계가 다른 날이면 목록이 다 비어 그려졌다
        val now = if (live != null) System.currentTimeMillis()
            else (Snapshot.parseDayKey(snap.date) ?: System.currentTimeMillis()) + (12 * 60 + 42) * 60_000L
        // 이름의 _ 뒤는 같은 위젯의 다른 크기(견주기용) — month_tall·anniversary_big·anniversary_wide
        val sizes = mapOf(
            "today" to (250 to 180), "nownext" to (250 to 110), "challenge" to (250 to 180), "monthgauge" to (250 to 110),
            "week" to (250 to 110), "month" to (250 to 250), "month_tall" to (320 to 440), "anniversary" to (110 to 110), "anniversary_big" to (170 to 170), "anniversary_wide" to (250 to 110), "dayprogress" to (110 to 110),
            "quickadd" to (250 to 40), "memo" to (250 to 110), "project" to (250 to 110),
        )
        for ((kind, size) in sizes) {
            for (dark in listOf(false, true)) {
                val palette = if (fam != null) Palette.of(fam, dark, if (dark) null else vintage) else Palette.of(snap.theme?.family, dark, snap.theme)
                val bmp = WidgetPainter(context, palette, WidgetPrefs.DEFAULT_ALPHA, snap, now = now).paint(kind.substringBefore("_"), size.first, size.second).bitmap
                File(dir, "widget_preview_${kind}${if (dark) "_dark" else ""}.png").outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
            }
        }
    }
}
