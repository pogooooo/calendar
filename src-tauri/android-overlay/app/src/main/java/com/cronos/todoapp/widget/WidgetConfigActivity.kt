package com.cronos.todoapp.widget

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.os.Bundle
import android.widget.ImageView
import android.widget.RadioGroup
import android.widget.SeekBar
import android.widget.TextView
import com.cronos.todoapp.R

/**
 * 위젯을 놓을 때 한 번 뜨는 설정 화면 (안드로이드 12+ 는 위젯을 길게 눌러 다시 연다).
 * 바탕 불투명도와 벌(앱 따라감 / 밝게 / 어둡게)을 정한다. 값은 위젯 id 마다 따로 산다.
 * 미리보기는 실제 화가(CelestialPainter)가 그린다 — 보이는 그대로 홈에 놓인다.
 */
class WidgetConfigActivity : Activity() {
    private var widgetId = AppWidgetManager.INVALID_APPWIDGET_ID
    private var kind = "today"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 취소하면 위젯이 놓이지 않도록, 먼저 CANCELED 로 둔다
        setResult(RESULT_CANCELED)
        widgetId = intent?.extras?.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID) ?: AppWidgetManager.INVALID_APPWIDGET_ID
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) { finish(); return }

        val manager = AppWidgetManager.getInstance(this)
        val provider = manager.getAppWidgetInfo(widgetId)?.provider?.className ?: ""
        kind = CronosWidgetProvider.PROVIDERS.firstOrNull { it.name == provider }?.let { cls ->
            try { (cls.getDeclaredConstructor().newInstance() as CronosWidgetProvider).kind } catch (e: Throwable) { null }
        } ?: "today"

        setContentView(R.layout.widget_config)
        val seek = findViewById<SeekBar>(R.id.cfg_alpha)
        val alphaText = findViewById<TextView>(R.id.cfg_alpha_value)
        val modes = findViewById<RadioGroup>(R.id.cfg_mode)
        val preview = findViewById<ImageView>(R.id.cfg_preview)

        seek.max = 80 // 20..100
        seek.progress = WidgetPrefs.alpha(this, widgetId) - 20
        modes.check(when (WidgetPrefs.mode(this, widgetId)) { "light" -> R.id.cfg_mode_light; "dark" -> R.id.cfg_mode_dark; else -> R.id.cfg_mode_app })

        val snap = Snapshot.load(this)
        val (wDp, hDp) = previewSize()
        fun repaint() {
            val alpha = seek.progress + 20
            alphaText.text = "$alpha%"
            val mode = when (modes.checkedRadioButtonId) { R.id.cfg_mode_light -> "light"; R.id.cfg_mode_dark -> "dark"; else -> "app" }
            val palette = Palette.resolve(snap?.theme, mode)
            preview.setImageBitmap(CelestialPainter(this, palette, alpha, snap).paint(kind, wDp, hDp).bitmap)
        }
        seek.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(sb: SeekBar?, p: Int, fromUser: Boolean) = repaint()
            override fun onStartTrackingTouch(sb: SeekBar?) {}
            override fun onStopTrackingTouch(sb: SeekBar?) {}
        })
        modes.setOnCheckedChangeListener { _, _ -> repaint() }
        repaint()

        findViewById<TextView>(R.id.cfg_ok).setOnClickListener {
            val mode = when (modes.checkedRadioButtonId) { R.id.cfg_mode_light -> "light"; R.id.cfg_mode_dark -> "dark"; else -> "app" }
            WidgetPrefs.save(this, widgetId, seek.progress + 20, mode)
            // 이 위젯만 새로 그린다 (놓는 순간에는 런처가 아직 onUpdate 를 안 불렀을 수 있다)
            val info = manager.getAppWidgetInfo(widgetId)
            val p = CronosWidgetProvider.PROVIDERS.firstOrNull { it.name == info?.provider?.className }
                ?.let { cls -> try { cls.getDeclaredConstructor().newInstance() as CronosWidgetProvider } catch (e: Throwable) { null } }
            if (p != null) manager.updateAppWidget(widgetId, p.build(this, manager, widgetId, snap))
            setResult(RESULT_OK, Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId))
            finish()
        }
        findViewById<TextView>(R.id.cfg_cancel).setOnClickListener { finish() }
    }

    /** 미리보기 크기: 종류의 기본 칸 수대로 */
    private fun previewSize(): Pair<Int, Int> = when (kind) {
        "nownext", "monthgauge", "week", "memo", "project" -> 250 to 110
        "month" -> 250 to 250
        "anniversary", "dayprogress" -> 110 to 110
        "quickadd" -> 250 to 40
        else -> 250 to 180
    }
}
