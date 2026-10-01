package com.cronos.todoapp.widget

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.text.InputType
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.cronos.todoapp.MainActivity
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import kotlin.concurrent.thread

/**
 * 빠른 추가 위젯을 누르면 뜨는 작은 입력 창 — 앱을 열지 않고 할 일 하나를 넣는다.
 *
 * 앱이 위젯 재료(widget-snapshot.json)에 넣어 둔 quickAdd(서버 주소·위젯 전용 열쇠·카테고리)로
 * /api/widget/todo 에 바로 쓴다. 앱의 홈 빠른 추가처럼 하루 종일 일정으로, 오늘 또는 내일에 넣는다.
 * 넣고 나면 위젯 재료에도 끼워 넣어 위젯에 곧장 보이게 하고, 뒤에 떠 있는 앱이 새로 받아 가도록
 * pending-link 에 cronos://refresh 를 남긴다 (안 그러면 옛 목록으로 재료를 덮어쓴다 — AndroidWidgetSync).
 *
 * quickAdd 가 없으면(로그아웃, 옛 앱이 쓴 재료) 예전처럼 앱의 할 일 추가 창을 연다.
 */
class QuickAddActivity : Activity() {
    private class Category(val id: String, val name: String, val color: Int)
    private class Result(val ok: Boolean, val body: JSONObject?, val message: String?)

    private lateinit var palette: Palette
    private lateinit var input: EditText
    private lateinit var status: TextView
    private lateinit var addButton: TextView
    private val dayChips = ArrayList<TextView>()
    private val categoryChips = ArrayList<TextView>()
    private var snap: Snapshot? = null
    private var api = ""
    private var token = ""
    private var categories: List<Category> = emptyList()
    private var categoryIndex = 0
    private var dayOffset = 0
    private var busy = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val quick = try {
            JSONObject(File(applicationInfo.dataDir, CronosWidgetProvider.SNAPSHOT_FILE).readText()).optJSONObject("quickAdd")
        } catch (e: Throwable) { null }
        api = quick?.optString("api").orEmpty().trimEnd('/')
        token = quick?.optString("token").orEmpty()
        categories = quick?.optJSONArray("categories")?.let { arr ->
            (0 until arr.length()).mapNotNull { i ->
                arr.optJSONObject(i)?.let { o ->
                    Category(o.optString("id"), o.optString("name"), Snapshot.parseColor(o.optString("color")) ?: 0xFFD4AF37.toInt())
                }
            }
        }.orEmpty()
        if (api.isBlank() || token.isBlank() || categories.isEmpty()) {
            openApp()
            finish()
            return
        }

        snap = Snapshot.load(this)
        palette = Palette.resolve(snap?.theme, "app")
        WindowCompat.setDecorFitsSystemWindows(window, false)
        @Suppress("DEPRECATION")
        run {
            window.statusBarColor = Color.TRANSPARENT
            window.navigationBarColor = Color.TRANSPARENT
        }
        setContentView(buildUi())

        input.requestFocus()
        WindowCompat.getInsetsController(window, input).show(WindowInsetsCompat.Type.ime())
    }

    private fun label(name: String, fallback: String) = snap?.label(name, fallback) ?: fallback

    private fun dp(v: Int): Int =
        TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics).toInt()

    private fun opaque(c: Int) = c or 0xFF000000.toInt()

    // ── 화면 ────────────────────────────────────────────────────────────

    private fun buildUi(): View {
        val root = FrameLayout(this).apply {
            setBackgroundColor(0x8C000000.toInt())
            setOnClickListener { if (!busy) finish() }
        }
        val radius = dp(14).toFloat()
        val sheet = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            isClickable = true // 시트를 눌러도 바탕의 "닫기" 로 새지 않게
            setPadding(dp(18), dp(16), dp(18), dp(14))
            background = GradientDrawable().apply {
                setColor(opaque(palette.bg))
                cornerRadii = floatArrayOf(radius, radius, radius, radius, 0f, 0f, 0f, 0f)
                setStroke(dp(1), palette.line)
            }
        }

        sheet.addView(TextView(this).apply {
            text = label("qaTitle", "할 일 추가")
            textSize = 13f
            letterSpacing = 0.12f
            setTextColor(palette.gold)
        }, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT))

        input = EditText(this).apply {
            hint = label("qaHint", "무엇을 할까요?")
            setHintTextColor(palette.muted)
            setTextColor(palette.ink)
            textSize = 17f
            isSingleLine = true
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
            imeOptions = EditorInfo.IME_ACTION_DONE
            background = GradientDrawable().apply {
                setColor(Color.TRANSPARENT)
                setStroke(dp(1), palette.line)
                cornerRadius = dp(6).toFloat()
            }
            setPadding(dp(12), dp(11), dp(12), dp(11))
            setOnEditorActionListener { _, actionId, event ->
                if (actionId == EditorInfo.IME_ACTION_DONE || event?.keyCode == KeyEvent.KEYCODE_ENTER) { submit(); true } else false
            }
        }
        sheet.addView(input, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { topMargin = dp(10) })

        // 언제: 오늘 · 내일
        val days = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        listOf(label("qaToday", "오늘"), label("tomorrow", "내일")).forEachIndexed { i, name ->
            val chip = chip(name, null)
            chip.setOnClickListener { dayOffset = i; paintChips() }
            dayChips += chip
            days.addView(chip, LinearLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT).apply { marginEnd = dp(8) })
        }
        sheet.addView(days, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { topMargin = dp(12) })

        // 어디에: 카테고리 (앱의 빠른 추가처럼 첫 것이 기본)
        val catRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        categories.forEachIndexed { i, c ->
            val chip = chip(c.name, c.color)
            chip.setOnClickListener { categoryIndex = i; paintChips() }
            categoryChips += chip
            catRow.addView(chip, LinearLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT).apply { marginEnd = dp(8) })
        }
        sheet.addView(HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            addView(catRow)
        }, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { topMargin = dp(8) })

        status = TextView(this).apply {
            textSize = 13f
            setTextColor(0xFFE0604F.toInt())
            visibility = View.GONE
        }
        sheet.addView(status, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { topMargin = dp(10) })

        val buttons = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.END or Gravity.CENTER_VERTICAL
        }
        buttons.addView(TextView(this).apply {
            text = label("qaCancel", "취소")
            textSize = 15f
            setTextColor(palette.muted)
            setPadding(dp(16), dp(10), dp(16), dp(10))
            setOnClickListener { if (!busy) finish() }
        })
        addButton = TextView(this).apply {
            text = label("qaAdd", "추가")
            textSize = 15f
            gravity = Gravity.CENTER
            minWidth = dp(88)
            setTextColor(opaque(palette.bg))
            setPadding(dp(18), dp(10), dp(18), dp(10))
            background = GradientDrawable().apply { setColor(palette.gold); cornerRadius = dp(6).toFloat() }
            setOnClickListener { submit() }
        }
        buttons.addView(addButton, LinearLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT).apply { marginStart = dp(6) })
        sheet.addView(buttons, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { topMargin = dp(12) })

        paintChips()
        root.addView(sheet, FrameLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT, Gravity.BOTTOM))

        // 화면 끝까지 그리는 창이라 시스템이 자판만큼 줄여 주지 않는다 — 자판·아래 막대 위로 시트를 들어 올린다
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            v.setPadding(0, bars.top, 0, maxOf(bars.bottom, ime.bottom))
            WindowInsetsCompat.CONSUMED
        }
        return root
    }

    private fun chip(text: String, dot: Int?): TextView = TextView(this).apply {
        this.text = text
        textSize = 13f
        isSingleLine = true
        gravity = Gravity.CENTER_VERTICAL
        setPadding(dp(12), dp(7), dp(12), dp(7))
        if (dot != null) {
            val d = GradientDrawable().apply { shape = GradientDrawable.OVAL; setColor(dot); setSize(dp(8), dp(8)) }
            setCompoundDrawablesRelativeWithIntrinsicBounds(d, null, null, null)
            compoundDrawablePadding = dp(6)
        }
    }

    private fun paintChips() {
        fun paint(v: TextView, on: Boolean, color: Int) {
            v.background = GradientDrawable().apply {
                cornerRadius = dp(16).toFloat()
                setColor(if (on) Palette.withAlpha(color, 0.22f) else Color.TRANSPARENT)
                setStroke(dp(1), if (on) color else palette.line)
            }
            v.setTextColor(if (on) palette.ink else palette.muted)
        }
        dayChips.forEachIndexed { i, v -> paint(v, i == dayOffset, palette.gold) }
        categoryChips.forEachIndexed { i, v -> paint(v, i == categoryIndex, categories[i].color) }
    }

    private fun setBusy(on: Boolean) {
        busy = on
        addButton.text = if (on) label("qaSaving", "넣는 중…") else label("qaAdd", "추가")
        addButton.alpha = if (on) 0.6f else 1f
        input.isEnabled = !on
    }

    // ── 넣기 ────────────────────────────────────────────────────────────

    private fun submit() {
        if (busy) return
        val title = input.text.toString().trim()
        if (title.isEmpty()) { input.requestFocus(); return }
        val category = categories[categoryIndex]
        val (start, end) = dayRange(dayOffset)
        status.visibility = View.GONE
        setBusy(true)
        thread {
            val result = post(title, category.id, start, end)
            runOnUiThread {
                if (isFinishing || isDestroyed) return@runOnUiThread
                if (result.ok) {
                    remember(result.body, title, category, start, end)
                    Toast.makeText(this, label("qaSaved", "추가했어요"), Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    setBusy(false)
                    status.text = result.message ?: label("qaFailed", "넣지 못했어요. 연결을 확인해 주세요.")
                    status.visibility = View.VISIBLE
                }
            }
        }
    }

    /** 그날 0시 ~ 23:59 (기기 시간대) — 앱의 홈 빠른 추가와 같은 하루 종일 일정 */
    private fun dayRange(offset: Int): Pair<Long, Long> {
        val c = Calendar.getInstance().apply {
            add(Calendar.DAY_OF_YEAR, offset)
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }
        val start = c.timeInMillis
        c.set(Calendar.HOUR_OF_DAY, 23); c.set(Calendar.MINUTE, 59)
        return start to c.timeInMillis
    }

    private fun iso(ms: Long): String =
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }.format(Date(ms))

    private fun post(title: String, categoryId: String, start: Long, end: Long): Result {
        var conn: HttpURLConnection? = null
        return try {
            conn = (URL("$api/api/widget/todo").openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 10_000
                readTimeout = 15_000
                doOutput = true
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
                setRequestProperty("Authorization", "Bearer $token")
            }
            val payload = JSONObject()
                .put("title", title).put("categoryId", categoryId)
                .put("startAt", iso(start)).put("endAt", iso(end)).put("isAllDay", true)
            conn.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }
            val code = conn.responseCode
            val text = (if (code in 200..299) conn.inputStream else conn.errorStream)
                ?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            val json = try { JSONObject(text) } catch (e: Throwable) { null }
            if (code in 200..299) Result(true, json, null)
            else Result(false, null, json?.optString("message")?.takeIf { it.isNotBlank() })
        } catch (e: Throwable) {
            Log.w("CronosQuickAdd", "보내지 못했다", e)
            Result(false, null, null)
        } finally {
            conn?.disconnect()
        }
    }

    /** 위젯 재료에 방금 넣은 것을 끼워 넣고, 앱에 새로 받아 가라고 남긴 뒤 위젯을 다시 그린다 */
    private fun remember(created: JSONObject?, title: String, category: Category, start: Long, end: Long) {
        val dir = File(applicationInfo.dataDir)
        try {
            val file = File(dir, CronosWidgetProvider.SNAPSHOT_FILE)
            val root = JSONObject(file.readText())
            val old = root.optJSONArray("todos") ?: JSONArray()
            val item = JSONObject()
                .put("id", created?.optString("id")?.takeIf { it.isNotBlank() } ?: "widget-${System.currentTimeMillis()}")
                .put("title", title).put("startAt", iso(start)).put("endAt", iso(end))
                .put("allDay", true).put("done", false)
                .put("color", String.format("#%06X", category.color and 0xFFFFFF))
            // 시작 시각 순서를 지킨다 — 앱이 쓴 재료도 그 순서다
            val list = (0 until old.length()).mapNotNull { old.optJSONObject(it) } + item
            root.put("todos", JSONArray(list.sortedBy { it.optString("startAt") }))
            val tmp = File(dir, "${CronosWidgetProvider.SNAPSHOT_FILE}.tmp")
            tmp.writeText(root.toString())
            tmp.renameTo(file)
        } catch (e: Throwable) { Log.w("CronosQuickAdd", "위젯 재료를 못 고쳤다", e) }
        try {
            val tmp = File(dir, "pending-link.txt.tmp")
            tmp.writeText("cronos://refresh/todos")
            tmp.renameTo(File(dir, "pending-link.txt"))
        } catch (e: Throwable) { Log.w("CronosQuickAdd", "앱에 남길 신호를 못 썼다", e) }
        WidgetRefresh.broadcast(this)
    }

    private fun openApp() {
        startActivity(
            Intent(Intent.ACTION_VIEW, Uri.parse("cronos://todo/new"), this, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
        )
    }
}
