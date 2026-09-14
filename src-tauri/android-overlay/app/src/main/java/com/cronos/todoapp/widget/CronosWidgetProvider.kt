package com.cronos.todoapp.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.view.View
import android.widget.RemoteViews
import com.cronos.todoapp.MainActivity
import com.cronos.todoapp.R
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

/**
 * 홈 위젯은 WebView 를 담을 수 없어 네이티브(RemoteViews)로 그린다.
 *
 * 재료는 앱(JS)이 `widget-snapshot.json` 에 써 둔다 (src/lib/widgetSnapshot.ts).
 * 예전에는 화면 밖 WebView 로 위젯 페이지를 찍어 그림으로 넘기려 했는데, 그 WebView 는
 * Tauri 가 만든 게 아니라 `tauri.localhost` 를 못 열어 늘 빈 그림이었다.
 *
 * 위젯 한 종류당 하나씩 상속해서 kind 만 바꾼다. 다시 그리는 때:
 *   - 시스템 주기(30분), 크기 변경
 *   - 앱이 스냅샷을 새로 쓸 때 (MainActivity 의 FileObserver → ACTION_REFRESH)
 *   - 앱을 벗어날 때 (MainActivity.onPause)
 *   - 시각이 경계를 넘을 때 — 다음 일정의 시작·끝, 그리고 자정 (AlarmManager 로 그 순간에 한 번)
 *     이게 없으면 "지금" 이 30분까지 늦게 바뀌고, 오늘 할 일이 자정을 넘겨도 어제 것을 보여 준다
 */
abstract class CronosWidgetProvider : AppWidgetProvider() {

    abstract val kind: String

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        val snap = Snapshot.load(context)
        ids.forEach { id -> manager.updateAppWidget(id, build(context, snap)) }
        // 놓인 위젯이 없으면 깨울 일도 없다 (ACTION_REFRESH 는 위젯이 없어도 온다)
        if (ids.isNotEmpty()) scheduleBoundaryRefresh(context, snap)
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        // 이 종류의 마지막 위젯이 없어졌다 — 깨울 일도 없다
        alarmManager(context).cancel(boundaryIntent(context))
    }

    /**
     * 다음 경계(가장 이른 일정 시작·끝, 또는 자정)에 한 번 다시 그리도록 예약한다.
     * 정확 알람(SCHEDULE_EXACT_ALARM) 은 권한이 필요하고 홈 위젯에 그만한 정밀도는 필요 없어
     * 느슨한 set() 을 쓴다 — 보통 몇 초, 절전 중엔 몇 분 늦을 수 있다. 예약은 늘 하나만 산다 (같은 PendingIntent 로 덮어쓴다).
     */
    private fun scheduleBoundaryRefresh(context: Context, snap: Snapshot?) {
        val now = System.currentTimeMillis()
        var next = nextMidnight(now)
        snap?.todos?.forEach { t ->
            if (t.start > now && t.start < next) next = t.start
            if (t.end > now && t.end < next) next = t.end
        }
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

    override fun onAppWidgetOptionsChanged(
        context: Context, manager: AppWidgetManager, id: Int, newOptions: android.os.Bundle,
    ) {
        manager.updateAppWidget(id, build(context, Snapshot.load(context)))
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            val manager = AppWidgetManager.getInstance(context)
            onUpdate(context, manager, manager.getAppWidgetIds(ComponentName(context, javaClass)))
        }
    }

    /** kind 에 맞는 줄들을 채운다. 제목·빈 문구·줄 목록만 다르고 틀은 같다. */
    private fun build(context: Context, snap: Snapshot?): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.widget_cronos)
        views.setOnClickPendingIntent(R.id.widget_root, openAppIntent(context))

        val content = when {
            snap == null -> Content(fallbackTitle(), emptyList(), "CRONOS")
            kind == "today" -> today(snap)
            kind == "nownext" -> nowNext(snap)
            else -> challenge(snap)
        }

        views.setTextViewText(R.id.widget_title, content.title)
        ROW_IDS.forEachIndexed { i, ids ->
            val row = content.rows.getOrNull(i)
            if (row == null) {
                views.setViewVisibility(ids.root, View.GONE)
            } else {
                views.setViewVisibility(ids.root, View.VISIBLE)
                views.setTextViewText(ids.main, row.main)
                views.setTextViewText(ids.side, row.side)
                views.setInt(ids.dot, "setColorFilter", row.color)
                // 끝낸 줄은 흐리게
                views.setInt(ids.main, "setTextColor", if (row.done) INK_DIM else INK)
                views.setInt(ids.side, "setTextColor", if (row.done) INK_DIM else INK_SOFT)
            }
        }
        views.setViewVisibility(R.id.widget_empty, if (content.rows.isEmpty()) View.VISIBLE else View.GONE)
        views.setTextViewText(R.id.widget_empty, content.empty)
        return views
    }

    private fun fallbackTitle() = when (kind) { "today" -> "TODAY"; "nownext" -> "NOW"; else -> "CHALLENGE" }

    private fun today(s: Snapshot): Content {
        val key = s.todayKey()
        val rows = s.todos
            .filter { it.spans(key) }
            .sortedWith(compareBy({ it.done }, { !it.allDay }, { it.start }))
            .map { Row(it.title, if (it.allDay) s.label("allDay") else it.timeRange(), it.color, it.done) }
        return Content(s.label("today"), rows, s.label("noTodayTodos"))
    }

    private fun nowNext(s: Snapshot): Content {
        val now = System.currentTimeMillis()
        val timed = s.todos.filter { !it.allDay }
        val current = timed.filter { it.start <= now && now < it.end }.minByOrNull { it.end }
        val next = timed.filter { it.start > now }.minByOrNull { it.start }
        val rows = ArrayList<Row>()
        rows += if (current != null) Row("${s.label("now")} · ${current.title}", current.timeRange(), current.color, false)
                else Row(s.label("now"), s.label("nothingNow"), INK_SOFT, true)
        rows += if (next != null) Row("${s.label("next")} · ${next.title}", next.timeRange(), next.color, false)
                else Row(s.label("next"), s.label("nothingNext"), INK_SOFT, true)
        return Content(s.label("now") + " · " + s.label("next"), rows, "")
    }

    private fun challenge(s: Snapshot): Content {
        val rows = s.challenges.map {
            val count = if (it.target != null) "${it.count}/${it.target}" else "${it.count}"
            Row(it.title, if (it.doneToday) "✦ $count" else count, GOLD, false)
        }
        return Content(s.label("challenge"), rows, s.label("noChallenges"))
    }

    private fun openAppIntent(context: Context): PendingIntent {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        return PendingIntent.getActivity(
            context, kind.hashCode(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    private data class Row(val main: String, val side: String, val color: Int, val done: Boolean)
    private data class Content(val title: String, val rows: List<Row>, val empty: String)
    private data class RowIds(val root: Int, val dot: Int, val main: Int, val side: Int)

    companion object {
        const val ACTION_REFRESH = "com.cronos.todoapp.WIDGET_REFRESH"
        const val SNAPSHOT_FILE = "widget-snapshot.json"
        /** 경계 알람의 requestCode 자리. 앱 열기 PendingIntent(kind.hashCode()) 와 겹치지 않게 띄운다 */
        private const val BOUNDARY_REQUEST = 0x5A00

        // 앱의 밤 팔레트와 같은 값
        private const val GOLD = 0xFFD4AF37.toInt()
        private const val INK = 0xFFECE6D6.toInt()
        private const val INK_SOFT = 0xFF9B947F.toInt()
        private const val INK_DIM = 0xFF5E5A50.toInt()

        private val ROW_IDS = listOf(
            RowIds(R.id.row1, R.id.row1_dot, R.id.row1_main, R.id.row1_side),
            RowIds(R.id.row2, R.id.row2_dot, R.id.row2_main, R.id.row2_side),
            RowIds(R.id.row3, R.id.row3_dot, R.id.row3_main, R.id.row3_side),
            RowIds(R.id.row4, R.id.row4_dot, R.id.row4_main, R.id.row4_side),
            RowIds(R.id.row5, R.id.row5_dot, R.id.row5_main, R.id.row5_side),
            RowIds(R.id.row6, R.id.row6_dot, R.id.row6_main, R.id.row6_side),
        )
    }
}

/** 앱이 써 둔 widget-snapshot.json. 없거나 깨졌으면 null. */
class Snapshot private constructor(
    val todos: List<Todo>,
    val challenges: List<Challenge>,
    private val labels: JSONObject,
) {
    class Todo(val title: String, val start: Long, val end: Long, val allDay: Boolean, val done: Boolean, val color: Int) {
        /** 사용자 시간대의 날짜 키(yyyy-MM-dd)로 오늘을 지나는가 */
        fun spans(key: String): Boolean = dayKey(start) <= key && key <= dayKey(end)
        fun timeRange(): String = "${hhmm(start)}–${hhmm(end)}"
    }
    class Challenge(val title: String, val count: Int, val target: Int?, val doneToday: Boolean)

    fun label(name: String): String = labels.optString(name, name)
    fun todayKey(): String = dayKey(System.currentTimeMillis())

    companion object {
        private val ISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
        private val DAY = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        private val HHMM = SimpleDateFormat("HH:mm", Locale.US)

        fun dayKey(ms: Long): String = DAY.format(Date(ms))
        fun hhmm(ms: Long): String = HHMM.format(Date(ms))

        fun load(context: Context): Snapshot? {
            // Rust 의 app_config_dir 은 안드로이드에서 dataDir 이다 (tauri PathPlugin.getConfigDir)
            val file = File(context.applicationInfo.dataDir, CronosWidgetProvider.SNAPSHOT_FILE)
            if (!file.exists()) return null
            return try {
                val root = JSONObject(file.readText())
                val todos = root.getJSONArray("todos").let { arr ->
                    (0 until arr.length()).map { i ->
                        val o = arr.getJSONObject(i)
                        Todo(
                            o.getString("title"),
                            ISO.parse(o.getString("startAt"))?.time ?: 0L,
                            ISO.parse(o.getString("endAt"))?.time ?: 0L,
                            o.optBoolean("allDay", false),
                            o.optBoolean("done", false),
                            parseColor(o.optString("color", "#D4AF37")),
                        )
                    }
                }
                val challenges = root.getJSONArray("challenges").let { arr ->
                    (0 until arr.length()).map { i ->
                        val o = arr.getJSONObject(i)
                        Challenge(
                            o.getString("title"),
                            o.optInt("count", 0),
                            if (o.isNull("target")) null else o.optInt("target"),
                            o.optBoolean("doneToday", false),
                        )
                    }
                }
                Snapshot(todos, challenges, root.optJSONObject("labels") ?: JSONObject())
            } catch (e: Throwable) {
                null
            }
        }

        private fun parseColor(s: String): Int = try { Color.parseColor(s) } catch (e: Throwable) { 0xFFD4AF37.toInt() }
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
