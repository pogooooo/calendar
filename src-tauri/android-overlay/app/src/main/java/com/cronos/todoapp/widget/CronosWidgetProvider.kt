package com.cronos.todoapp.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.RemoteViews
import com.cronos.todoapp.MainActivity
import com.cronos.todoapp.R
import java.util.Calendar

/**
 * 홈 위젯 — 앱이 그린 그림 한 장(WidgetPainter)을 ImageView 에 얹고, 그 위에 투명한 칸을 겹쳐 누르는 자리를 단다.
 *
 * 재료는 앱(JS)이 `widget-snapshot.json` 에 써 둔다 (src/lib/widgetSnapshot.ts). 홈 위젯은 WebView 를
 * 담을 수 없고 쓸 수 있는 뷰도 몇 가지뿐이라, 앱 화면과 같은 말(Orbit 글꼴·마름모·눈금)을 내려면
 * 그림으로 그리는 수밖에 없다.
 *
 * 위젯 한 종류당 하나씩 상속해서 kind 만 바꾼다. 다시 그리는 때:
 *   - 시스템 주기(30분), 크기 변경, 설정 변경(WidgetConfigActivity)
 *   - 앱이 스냅샷을 새로 쓸 때 (MainActivity 의 FileObserver → ACTION_REFRESH)
 *   - 앱을 벗어날 때 (MainActivity.onPause)
 *   - 시각이 경계를 넘을 때 — 다음 일정의 시작·끝, 자정 (AlarmManager 로 그 순간에 한 번).
 *     진행 중인 일정이 있는 "지금·다음" 과 "하루 진행" 은 실선이 밀리도록 몇 분마다 한 번 더
 */
abstract class CronosWidgetProvider : AppWidgetProvider() {

    abstract val kind: String
    /** 놓인 뒤 아직 크기를 모를 때 쓰는 기본 크기 (dp) */
    open val defaultSizeDp: Pair<Int, Int> = 250 to 180

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        val snap = Snapshot.load(context)
        ids.forEach { id -> manager.updateAppWidget(id, build(context, manager, id, snap)) }
        // 놓인 위젯이 없으면 깨울 일도 없다 (ACTION_REFRESH 는 위젯이 없어도 온다)
        if (ids.isNotEmpty()) scheduleNextRefresh(context, snap)
    }

    override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, newOptions: Bundle) {
        manager.updateAppWidget(id, build(context, manager, id, Snapshot.load(context)))
    }

    override fun onDeleted(context: Context, ids: IntArray) {
        super.onDeleted(context, ids)
        WidgetPrefs.remove(context, ids)
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        // 이 종류의 마지막 위젯이 없어졌다 — 깨울 일도 없다
        alarmManager(context).cancel(boundaryIntent(context))
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            val manager = AppWidgetManager.getInstance(context)
            onUpdate(context, manager, manager.getAppWidgetIds(ComponentName(context, javaClass)))
        }
        if (intent.action == ACTION_SHIFT) {
            val id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
            if (id == AppWidgetManager.INVALID_APPWIDGET_ID) return
            val delta = intent.getIntExtra(EXTRA_DELTA, 0)
            WidgetPrefs.setOffset(context, id, if (delta == 0) 0 else WidgetPrefs.offset(context, id) + delta)
            val manager = AppWidgetManager.getInstance(context)
            manager.updateAppWidget(id, build(context, manager, id, Snapshot.load(context)))
        }
    }

    /** 위젯 하나를 그린다: 설정(투명도·벌) + 크기 → 그림 + 누르는 칸 */
    fun build(context: Context, manager: AppWidgetManager, id: Int, snap: Snapshot?): RemoteViews {
        val (wDp, hDp) = sizeDp(manager, id)
        val alpha = WidgetPrefs.alpha(context, id)
        val palette = Palette.resolve(snap?.theme, WidgetPrefs.mode(context, id))
        // 옮겨 볼 수 있는 것은 한 때를 보여 주는 위젯만 — "지금·다음" 처럼 시각이 중요한 것은 늘 지금이다.
        // 한 칸의 크기는 화가가 종류에 맞춰 잡는다 (오늘=하루, 주간=한 주, 월간=한 달)
        val steps = if (kind in SHIFT_KINDS) WidgetPrefs.offset(context, id) else 0
        val painted = WidgetPainter(context, palette, alpha, snap, steps = steps).paint(kind, wDp, hDp)

        val views = RemoteViews(context.packageName, R.layout.widget_canvas)
        views.setImageViewBitmap(R.id.widget_image, painted.bitmap)
        views.setContentDescription(R.id.widget_image, context.getString(labelRes()))
        views.setOnClickPendingIntent(R.id.widget_root, link(context, id, 0, rootLink(snap)))

        // 날짜 넘김 — 왼쪽은 뒤로, 오른쪽은 앞으로. 옮긴 채로 두어도 날이 바뀌면 오늘로 돌아온다 (WidgetPrefs.offset)
        val canShift = kind in SHIFT_KINDS
        views.setViewVisibility(R.id.ov_prev, if (canShift) View.VISIBLE else View.GONE)
        views.setViewVisibility(R.id.ov_next, if (canShift) View.VISIBLE else View.GONE)
        if (canShift) {
            views.setOnClickPendingIntent(R.id.ov_prev, shift(context, id, -1))
            views.setOnClickPendingIntent(R.id.ov_next, shift(context, id, 1))
        }

        views.setViewVisibility(R.id.ov_rows, if (painted.overlay == WidgetPainter.Overlay.ROWS) View.VISIBLE else View.GONE)
        views.setViewVisibility(R.id.ov_week, if (painted.overlay == WidgetPainter.Overlay.WEEK) View.VISIBLE else View.GONE)
        views.setViewVisibility(R.id.ov_month, if (painted.overlay == WidgetPainter.Overlay.MONTH) View.VISIBLE else View.GONE)
        when (painted.overlay) {
            WidgetPainter.Overlay.ROWS -> ROW_IDS.forEachIndexed { i, rid ->
                views.setOnClickPendingIntent(rid, link(context, id, 1 + i, painted.rowLinks.getOrNull(i) ?: rootLink(snap)))
            }
            WidgetPainter.Overlay.WEEK -> WEEK_IDS.forEachIndexed { i, cid ->
                views.setOnClickPendingIntent(cid, link(context, id, 8 + i, painted.cellLinks.getOrNull(i) ?: rootLink(snap)))
            }
            WidgetPainter.Overlay.MONTH -> {
                views.setViewVisibility(R.id.ov_mrow6, if (painted.monthRows >= 6) View.VISIBLE else View.GONE)
                MONTH_IDS.forEachIndexed { i, cid ->
                    views.setOnClickPendingIntent(cid, link(context, id, 16 + i, painted.cellLinks.getOrNull(i) ?: rootLink(snap)))
                }
            }
            else -> {}
        }
        return views
    }

    /** 이 종류의 위젯을 그냥 눌렀을 때 갈 곳 */
    private fun rootLink(snap: Snapshot?): String = when (kind) {
        "today", "dayprogress", "monthgauge", "memo" -> "cronos://home"
        "nownext" -> "cronos://day/${(snap?.todayKey() ?: Snapshot.dayKey(System.currentTimeMillis()))}"
        "challenge" -> "cronos://challenge"
        "week", "month" -> "cronos://month"
        "anniversary" -> "cronos://anniversary"
        "quickadd" -> "cronos://todo/new"
        "project" -> "cronos://project"
        else -> "cronos://home"
    }

    private fun labelRes(): Int = when (kind) {
        "today" -> R.string.widget_today_label; "nownext" -> R.string.widget_nownext_label; "challenge" -> R.string.widget_challenge_label
        "monthgauge" -> R.string.widget_monthgauge_label; "week" -> R.string.widget_week_label; "month" -> R.string.widget_month_label
        "anniversary" -> R.string.widget_anniversary_label; "dayprogress" -> R.string.widget_dayprogress_label
        "quickadd" -> R.string.widget_quickadd_label; "memo" -> R.string.widget_memo_label; else -> R.string.widget_project_label
    }

    /** 런처가 알려 준 크기 (세로 화면 기준: 폭은 min, 높이는 max). 모르면 기본값 */
    private fun sizeDp(manager: AppWidgetManager, id: Int): Pair<Int, Int> {
        val o = manager.getAppWidgetOptions(id)
        val w = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0)
        val h = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0)
        return (if (w > 0) w else defaultSizeDp.first).coerceIn(40, 800) to (if (h > 0) h else defaultSizeDp.second).coerceIn(40, 800)
    }

    /** 날짜 넘김 단추 하나. requestCode 는 링크 자리(widgetId*64+slot)의 위쪽을 쓴다 */
    private fun shift(context: Context, widgetId: Int, delta: Int): PendingIntent {
        val intent = Intent(context, javaClass).setAction(ACTION_SHIFT)
            .putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
            .putExtra(EXTRA_DELTA, delta)
        return PendingIntent.getBroadcast(
            context, widgetId * 64 + (if (delta < 0) 58 else 59), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    /**
     * `cronos://…` 를 MainActivity 로. 앱(AndroidWidgetSync)이 그 링크를 받아 화면을 옮긴다.
     * requestCode 와 data 가 다르면 서로 다른 PendingIntent 다 — 줄마다 다른 곳으로 가야 하니까.
     */
    private fun link(context: Context, widgetId: Int, slot: Int, uri: String): PendingIntent {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(uri), context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        return PendingIntent.getActivity(
            context, widgetId * 64 + slot, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    // ── 시각 경계에서 다시 그리기 ──────────────────────────────────

    /**
     * 다음 경계(가장 이른 일정 시작·끝, 또는 자정)에 한 번 다시 그리도록 예약한다.
     * 정확 알람(SCHEDULE_EXACT_ALARM)은 권한이 필요하고 홈 위젯에 그만한 정밀도는 필요 없어
     * 느슨한 set() 을 쓴다 — 보통 몇 초, 절전 중엔 몇 분 늦을 수 있다. 예약은 늘 하나만 산다 (같은 PendingIntent 로 덮어쓴다).
     */
    private fun scheduleNextRefresh(context: Context, snap: Snapshot?) {
        val now = System.currentTimeMillis()
        var next = nextMidnight(now)
        snap?.todos?.forEach { t ->
            if (t.start > now && t.start < next) next = t.start
            if (t.end > now && t.end < next) next = t.end
        }
        // 실선이 흐르는 위젯은 사이사이에도 한 번씩
        val tick = when (kind) {
            "nownext" -> if (snap?.todos?.any { !it.allDay && it.start <= now && now < it.end } == true) 5 * 60_000L else null
            "dayprogress" -> 15 * 60_000L
            else -> null
        }
        if (tick != null && now + tick < next) next = now + tick
        // 경계 1초 뒤 — 딱 그 시각에 깨면 "아직 안 지났다" 로 판정될 수 있다
        alarmManager(context).set(AlarmManager.RTC, next + 1_000L, boundaryIntent(context))
    }

    private fun boundaryIntent(context: Context): PendingIntent =
        PendingIntent.getBroadcast(
            context, BOUNDARY_REQUEST + kind.hashCode(),
            Intent(context, javaClass).setAction(ACTION_REFRESH),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

    private fun alarmManager(context: Context) = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    private fun nextMidnight(now: Long): Long = Calendar.getInstance().apply {
        timeInMillis = now
        add(Calendar.DAY_OF_YEAR, 1)
        set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
    }.timeInMillis

    companion object {
        const val ACTION_REFRESH = "com.cronos.todoapp.WIDGET_REFRESH"
        const val ACTION_SHIFT = "com.cronos.todoapp.WIDGET_SHIFT"
        const val EXTRA_DELTA = "delta"
        /** 때를 옮겨 볼 수 있는 종류 — 오늘(하루씩)·주간(한 주씩)·월간(한 달씩) */
        val SHIFT_KINDS = setOf("today", "week", "month")
        const val SNAPSHOT_FILE = "widget-snapshot.json"
        /** 경계 알람의 requestCode 자리. 링크 PendingIntent(widgetId*64+slot) 와 겹치지 않게 띄운다 */
        private const val BOUNDARY_REQUEST = 0x5A000000

        val KINDS = listOf("today", "nownext", "challenge", "monthgauge", "week", "month", "anniversary", "dayprogress", "quickadd", "memo", "project")

        val PROVIDERS: List<Class<out CronosWidgetProvider>> = listOf(
            TodayWidgetProvider::class.java, NowNextWidgetProvider::class.java, ChallengeWidgetProvider::class.java,
            MonthGaugeWidgetProvider::class.java, WeekWidgetProvider::class.java, MonthWidgetProvider::class.java,
            AnniversaryWidgetProvider::class.java, DayProgressWidgetProvider::class.java, QuickAddWidgetProvider::class.java,
            MemoWidgetProvider::class.java, ProjectWidgetProvider::class.java,
        )

        val ROW_IDS = intArrayOf(R.id.ov_row1, R.id.ov_row2, R.id.ov_row3, R.id.ov_row4, R.id.ov_row5, R.id.ov_row6)
        val WEEK_IDS = intArrayOf(R.id.ov_w1, R.id.ov_w2, R.id.ov_w3, R.id.ov_w4, R.id.ov_w5, R.id.ov_w6, R.id.ov_w7)
        val MONTH_IDS = intArrayOf(
            R.id.ov_m1, R.id.ov_m2, R.id.ov_m3, R.id.ov_m4, R.id.ov_m5, R.id.ov_m6, R.id.ov_m7,
            R.id.ov_m8, R.id.ov_m9, R.id.ov_m10, R.id.ov_m11, R.id.ov_m12, R.id.ov_m13, R.id.ov_m14,
            R.id.ov_m15, R.id.ov_m16, R.id.ov_m17, R.id.ov_m18, R.id.ov_m19, R.id.ov_m20, R.id.ov_m21,
            R.id.ov_m22, R.id.ov_m23, R.id.ov_m24, R.id.ov_m25, R.id.ov_m26, R.id.ov_m27, R.id.ov_m28,
            R.id.ov_m29, R.id.ov_m30, R.id.ov_m31, R.id.ov_m32, R.id.ov_m33, R.id.ov_m34, R.id.ov_m35,
            R.id.ov_m36, R.id.ov_m37, R.id.ov_m38, R.id.ov_m39, R.id.ov_m40, R.id.ov_m41, R.id.ov_m42,
        )
    }
}

class TodayWidgetProvider : CronosWidgetProvider() { override val kind = "today" }
class NowNextWidgetProvider : CronosWidgetProvider() { override val kind = "nownext"; override val defaultSizeDp = 250 to 110 }
class ChallengeWidgetProvider : CronosWidgetProvider() { override val kind = "challenge" }
class MonthGaugeWidgetProvider : CronosWidgetProvider() { override val kind = "monthgauge"; override val defaultSizeDp = 250 to 110 }
class WeekWidgetProvider : CronosWidgetProvider() { override val kind = "week"; override val defaultSizeDp = 250 to 110 }
class MonthWidgetProvider : CronosWidgetProvider() { override val kind = "month"; override val defaultSizeDp = 250 to 250 }
class AnniversaryWidgetProvider : CronosWidgetProvider() { override val kind = "anniversary"; override val defaultSizeDp = 110 to 110 }
class DayProgressWidgetProvider : CronosWidgetProvider() { override val kind = "dayprogress"; override val defaultSizeDp = 110 to 110 }
class QuickAddWidgetProvider : CronosWidgetProvider() { override val kind = "quickadd"; override val defaultSizeDp = 250 to 40 }
class MemoWidgetProvider : CronosWidgetProvider() { override val kind = "memo"; override val defaultSizeDp = 250 to 110 }
class ProjectWidgetProvider : CronosWidgetProvider() { override val kind = "project"; override val defaultSizeDp = 250 to 110 }
