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
 * 디버그 빌드에서만 일한다.
 */
class PreviewRenderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val debuggable = (context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
        if (!debuggable) return
        val dir = File(context.filesDir, "previews").apply { mkdirs() }
        val snap = (if (intent.getBooleanExtra("live", false)) Snapshot.load(context) else null)
            ?: Snapshot.parse(context.assets.open("widget-sample.json").bufferedReader().readText())
        val sizes = mapOf(
            "today" to (250 to 180), "nownext" to (250 to 110), "challenge" to (250 to 180), "monthgauge" to (250 to 110),
            "week" to (250 to 110), "month" to (250 to 250), "anniversary" to (110 to 110), "dayprogress" to (110 to 110),
            "quickadd" to (250 to 40), "memo" to (250 to 110), "project" to (250 to 110),
        )
        for ((kind, size) in sizes) {
            for (dark in listOf(false, true)) {
                val bmp = WidgetPainter(context, Palette.of(snap.theme?.family, dark, snap.theme), WidgetPrefs.DEFAULT_ALPHA, snap).paint(kind, size.first, size.second).bitmap
                File(dir, "widget_preview_${kind}${if (dark) "_dark" else ""}.png").outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
            }
        }
    }
}
