package com.cronos.todoapp.widget

import android.app.Activity
import android.app.AlertDialog
import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Intent
import android.graphics.Color
import android.graphics.Paint
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.os.Build
import android.text.InputFilter
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.view.WindowManager
import android.window.OnBackInvokedDispatcher
import android.widget.*
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.cronos.todoapp.MainActivity
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import kotlin.concurrent.thread

/** A small native editor over the launcher. RemoteViews cannot contain an EditText. */
class WidgetEditActivity : Activity() {
    private lateinit var client: WidgetDataClient
    private lateinit var palette: Palette
    private lateinit var sheet: LinearLayout
    private lateinit var footer: LinearLayout
    private var saveButton: TextView? = null
    private var fieldParent: LinearLayout? = null
    private lateinit var status: TextView
    private var day = ""
    private var categories = JSONArray()
    private var items = JSONArray()
    private var busy = false
    private var generation = 0
    private var occurrence: JSONObject? = null
    private var source: JSONObject? = null
    private var titleInput: EditText? = null
    private var memoInput: EditText? = null
    private var categoryInput: Spinner? = null
    private var allDayInput: CheckBox? = null
    private lateinit var start: Calendar
    private lateinit var end: Calendar
    private var formId: String? = null
    private var initialDraft: String? = null
    private var requestId = java.util.UUID.randomUUID().toString()
    private var submittedPayload: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        client = WidgetDataClient(this)
        palette = Palette.resolve(Snapshot.load(this)?.theme, "app")
        day = (savedInstanceState?.getString("day") ?: intent.getStringExtra("day"))?.takeIf { it.matches(Regex("\\d{4}-\\d{2}-\\d{2}")) } ?: dayKey(Calendar.getInstance(client.timeZone))
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
        @Suppress("DEPRECATION")
        run { window.statusBarColor = Color.TRANSPARENT; window.navigationBarColor = Color.TRANSPARENT }
        val root = FrameLayout(this).apply {
            setBackgroundColor(0x88000000.toInt())
            setOnClickListener { if (!busy) leaveForm { finish() } }
        }
        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; isClickable = true
            background = GradientDrawable().apply {
                setColor(palette.bg or 0xFF000000.toInt()); cornerRadius = dp(20).toFloat()
            }
        }
        sheet = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; isClickable = true
            setPadding(dp(18), dp(12), dp(18), dp(20))
        }
        val scroll = ScrollView(this).apply { isFillViewport = false; addView(sheet) }
        panel.addView(scroll, LinearLayout.LayoutParams(MATCH_PARENT, 0, 1f))
        footer = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(18), dp(8), dp(18), dp(12)); visibility = View.GONE }
        panel.addView(footer, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT))
        // Keep the launcher visible behind this editor instead of presenting another full app screen.
        root.addView(panel, FrameLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT, Gravity.BOTTOM))
        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            view.setPadding(bars.left, bars.top + dp(12), bars.right, maxOf(bars.bottom, ime.bottom))
            insets
        }
        setContentView(root)
        if (Build.VERSION.SDK_INT >= 33) {
            onBackInvokedDispatcher.registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT) {
                if (!busy) leaveForm { finish() } else status.text = "처리 중입니다. 결과를 확인한 뒤 닫아 주세요."
            }
        }
        categories = client.root.optJSONObject("quickAdd")?.optJSONArray("categories") ?: JSONArray()
        if (!client.ready) { loginRequired(); return }
        val mode = intent.getStringExtra("mode") ?: "day"
        val id = intent.getStringExtra("id")
        val restored = savedInstanceState?.getString("form")?.let { JSONObject(it) }
        if (restored != null && categories.length() > 0) {
            requestId = restored.optString("requestId", requestId); submittedPayload = restored.optString("submitted").takeIf { it.isNotBlank() }
            showForm(restored.optJSONObject("source"), restored.optJSONObject("occurrence"), restored); return
        }
        // Cached category IDs are sufficient to start typing; the server checks permission on save.
        if (mode == "new" && categories.length() > 0) { showForm(null, null); focusTitle(); return }
        loadDay { if (mode == "new") { showForm(null, null); focusTitle() } else if (mode == "todo" && id != null) openTodo(id) else showDay() }
    }

    private fun focusTitle() {
        titleInput?.post {
            val field = titleInput ?: return@post
            if (!isFinishing && !isDestroyed) {
                field.requestFocus()
                WindowCompat.getInsetsController(window, field).show(WindowInsetsCompat.Type.ime())
            }
        }
    }

    private fun dp(value: Int) = (resources.displayMetrics.density * value).toInt()
    private fun dayKey(calendar: Calendar) = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply { timeZone = client.timeZone }.format(calendar.time)
    private fun atDay(key: String): Calendar = Calendar.getInstance(client.timeZone).apply {
        time = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply { timeZone = client.timeZone; isLenient = false }.parse(key)!!
    }
    private fun parseInstant(value: String): Calendar? {
        if (value.isBlank() || value == "null") return null
        for (pattern in listOf("yyyy-MM-dd'T'HH:mm:ss.SSSX", "yyyy-MM-dd'T'HH:mm:ssX")) {
            try { return Calendar.getInstance(client.timeZone).apply { time = SimpleDateFormat(pattern, Locale.US).parse(value)!! } } catch (_: Exception) {}
        }
        return null
    }
    private fun iso(calendar: Calendar) = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }.format(calendar.time)
    private fun text(value: String, size: Float = 15f) = TextView(this).apply { text = value; textSize = size; setTextColor(palette.ink); setPadding(0, dp(8), 0, dp(8)) }
    private fun button(value: String, action: () -> Unit): TextView = Button(this).apply {
        text = value; textSize = 15f; setTextColor(palette.ink); isAllCaps = false
        gravity = Gravity.CENTER; minHeight = dp(48); setPadding(dp(10), dp(8), dp(10), dp(8))
        background = GradientDrawable().apply { setColor(Palette.withAlpha(palette.ink, .07f)); cornerRadius = dp(9).toFloat() }
        isFocusable = true; contentDescription = value
        setOnClickListener { if (!busy) action() }
    }
    private fun add(view: View) { (fieldParent ?: sheet).addView(view, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { bottomMargin = dp(8) }) }
    private fun row(vararg views: View): LinearLayout = LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL
        views.forEachIndexed { i, view -> addView(view, LinearLayout.LayoutParams(0, WRAP_CONTENT, 1f).apply { if (i > 0) marginStart = dp(6) }) }
    }
    private fun header(title: String, back: Boolean = false) {
        sheet.removeAllViews()
        fieldParent = null; footer.removeAllViews(); footer.visibility = View.GONE; saveButton = null
        add(row(text(title, 20f), button(if (back) "목록" else "닫기") { leaveForm { if (back) showDay() else finish() } }))
        status = text("", 13f).apply { accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE; setTextColor(palette.muted) }
        add(status)
    }
    private fun loginRequired() {
        header("위젯 편집")
        status.text = "앱에서 로그인한 뒤 위젯을 다시 눌러 주세요."
        add(button("앱에서 로그인") { startActivity(Intent(this, MainActivity::class.java)); finish() })
    }
    private fun message(error: Throwable) = if (error is WidgetRequestError && error.status == 401) "로그인이 만료되었습니다. 앱에서 다시 로그인해 주세요." else error.message ?: "연결을 확인해 주세요."
    private fun loadDay(after: () -> Unit = { showDay() }) {
        header("위젯 일정")
        status.text = "일정을 불러오는 중…"
        request({ client.day(day) }, { data ->
            categories = data.optJSONArray("categories") ?: JSONArray()
            items = data.optJSONArray("items") ?: JSONArray()
            after()
        }, { error ->
            status.text = message(error)
            add(button("다시 불러오기") { loadDay(after) })
            if (error is WidgetRequestError && error.status == 401) add(button("앱에서 로그인") { startActivity(Intent(this, MainActivity::class.java)); finish() })
        })
    }
    private fun showDay() {
        initialDraft = null
        formId = null; source = null; occurrence = null
        header(day.replace('-', '.'))
        add(row(button("이전 날짜") { moveDay(-1) }, button("날짜 선택") { pickDay(atDay(day)) { day = dayKey(it); loadDay() } }, button("다음 날짜") { moveDay(1) }))
        add(row(button("오늘") { day = dayKey(Calendar.getInstance(client.timeZone)); loadDay() }, button("＋ 할 일 추가") { showForm(null, null) }))
        if (items.length() == 0) add(text("등록된 할 일이 없습니다. 위에서 바로 추가하세요."))
        for (i in 0 until items.length()) {
            val todo = items.getJSONObject(i)
            val done = todo.optBoolean("done")
            val check = button(if (done) "완료 취소" else "완료") { complete(todo, !done) }
            val name = button(todo.optString("title") + "\n" + timeLabel(todo)) { openTodo(todo.optString("id"), todo) }.apply {
                gravity = Gravity.START or Gravity.CENTER_VERTICAL
                if (done) paintFlags = paintFlags or Paint.STRIKE_THRU_TEXT_FLAG
            }
            val line = LinearLayout(this).apply {
                gravity = Gravity.CENTER_VERTICAL
                addView(check, LinearLayout.LayoutParams(dp(86), WRAP_CONTENT))
                addView(name, LinearLayout.LayoutParams(0, WRAP_CONTENT, 1f).apply { marginStart = dp(8) })
            }
            add(line)
        }
        status.text = "할 일을 누르면 내용과 시간을 수정할 수 있습니다."
    }
    private fun timeLabel(todo: JSONObject): String {
        if (todo.optBoolean("allDay")) return "하루 종일"
        val formatter = SimpleDateFormat("HH:mm", Locale.getDefault()).apply { timeZone = client.timeZone }
        val a = parseInstant(todo.optString("startAt")); val b = parseInstant(todo.optString("endAt"))
        return if (a == null || b == null) "시간 미지정" else formatter.format(a.time) + " – " + formatter.format(b.time)
    }
    private fun moveDay(delta: Int) { day = dayKey(atDay(day).apply { add(Calendar.DAY_OF_MONTH, delta) }); loadDay() }
    private fun openTodo(id: String, selected: JSONObject? = null) {
        val item = selected ?: (0 until items.length()).map { items.getJSONObject(it) }.firstOrNull { it.optString("id") == id }
        request({ client.request("GET", "/api/widget/todo?id=${client.query(id)}") }, { showForm(it, item) })
    }
    private fun field(label: String, value: String, max: Int, multiline: Boolean = false): EditText {
        val caption = text(label, 13f)
        add(caption)
        return EditText(this).apply {
            setText(value); textSize = 16f; setTextColor(palette.ink); setHintTextColor(palette.muted)
            setPadding(dp(10), dp(10), dp(10), dp(10)); minHeight = dp(48)
            filters = arrayOf(InputFilter.LengthFilter(max))
            inputType = InputType.TYPE_CLASS_TEXT or (if (multiline) InputType.TYPE_TEXT_FLAG_MULTI_LINE else InputType.TYPE_TEXT_FLAG_CAP_SENTENCES)
            setSingleLine(!multiline); if (multiline) { minLines = 2; maxLines = 5 }
            id = View.generateViewId(); caption.labelFor = id
            background = GradientDrawable().apply { setColor(Palette.withAlpha(palette.ink, .04f)); setStroke(dp(1), Palette.withAlpha(palette.ink, .2f)); cornerRadius = dp(8).toFloat() }
        }.also { add(it) }
    }
    private fun showForm(todo: JSONObject?, selected: JSONObject?, restored: JSONObject? = null) {
        if (restored == null) { requestId = java.util.UUID.randomUUID().toString(); submittedPayload = null }
        source = todo; occurrence = selected; formId = todo?.optString("id")
        header(if (todo == null) "할 일 추가" else "할 일 수정", true)
        if ((todo?.optInt("repeat") ?: 0) > 0) status.text = "내용·시간 수정은 반복 일정 전체에 적용됩니다. 삭제는 선택한 회차에만 적용됩니다."
        titleInput = field("제목", restored?.optString("title") ?: todo?.optString("title").orEmpty(), 1000)
        start = parseInstant(todo?.optString("startAt").orEmpty()) ?: atDay(day)
        end = parseInstant(todo?.optString("endAt").orEmpty()) ?: atDay(day).apply { add(Calendar.DAY_OF_MONTH, 1); add(Calendar.MILLISECOND, -1) }
        // The app also stores all-day ranges with an exclusive midnight end. Show its last included day.
        if (todo?.optBoolean("isAllDay") == true && end.after(start) && end.get(Calendar.HOUR_OF_DAY) == 0 && end.get(Calendar.MINUTE) == 0 && end.get(Calendar.SECOND) == 0 && end.get(Calendar.MILLISECOND) == 0) end.add(Calendar.MILLISECOND, -1)
        if (restored != null) { start.timeInMillis = restored.getLong("start"); end.timeInMillis = restored.getLong("end") }
        allDayInput = CheckBox(this).apply {
            text = "하루 종일"; setTextColor(palette.ink); minHeight = dp(48)
            isChecked = restored?.optBoolean("allDay") ?: todo?.optBoolean("isAllDay") ?: true
        }.also { add(it) }
        val dateStart = button("") {}; val dateEnd = button("") {}
        val timeStart = button("") {}; val timeEnd = button("") {}
        fun labels() {
            dateStart.text = "시작 ${dayKey(start)}"; dateEnd.text = "종료 ${dayKey(end)}"
            timeStart.text = String.format(Locale.getDefault(), "시작 %02d:%02d", start.get(Calendar.HOUR_OF_DAY), start.get(Calendar.MINUTE))
            timeEnd.text = String.format(Locale.getDefault(), "종료 %02d:%02d", end.get(Calendar.HOUR_OF_DAY), end.get(Calendar.MINUTE))
            val visible = if (allDayInput!!.isChecked) View.GONE else View.VISIBLE
            timeStart.visibility = visible; timeEnd.visibility = visible
        }
        dateStart.setOnClickListener { if (!busy) pickDay(start) { start = it; if (end.before(start)) end = start.clone() as Calendar; labels() } }
        dateEnd.setOnClickListener { if (!busy) pickDay(end) { end = it; labels() } }
        timeStart.setOnClickListener { if (!busy) pickTime(start) { labels() } }
        timeEnd.setOnClickListener { if (!busy) pickTime(end) { labels() } }
        allDayInput!!.setOnCheckedChangeListener { _, checked ->
            if (!checked && formId == null && start.get(Calendar.HOUR_OF_DAY) == 0 && end.get(Calendar.HOUR_OF_DAY) == 23) {
                start.set(Calendar.HOUR_OF_DAY, 9); end = start.clone() as Calendar; end.add(Calendar.HOUR_OF_DAY, 1)
            }
            labels()
        }
        labels(); add(row(dateStart, dateEnd)); add(row(timeStart, timeEnd))
        val details = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; visibility = View.GONE }
        val toggle = button("카테고리 · 메모 설정 펼치기") {}
        toggle.setOnClickListener {
            if (busy) return@setOnClickListener
            val open = details.visibility != View.VISIBLE
            details.visibility = if (open) View.VISIBLE else View.GONE
            toggle.text = if (open) "카테고리 · 메모 설정 접기" else "카테고리 · 메모 설정 펼치기"
        }
        add(toggle); add(details); fieldParent = details
        val categoryLabel = text("카테고리", 13f); add(categoryLabel)
        categoryInput = Spinner(this).apply {
            id = View.generateViewId(); categoryLabel.labelFor = id
            val names = (0 until categories.length()).map { categories.getJSONObject(it).optString("name") }
            adapter = object : ArrayAdapter<String>(this@WidgetEditActivity, android.R.layout.simple_spinner_dropdown_item, names) {
                override fun getView(position: Int, convertView: View?, parent: android.view.ViewGroup): View = super.getView(position, convertView, parent).apply { (this as? TextView)?.setTextColor(palette.ink) }
            }
            minimumHeight = dp(48)
            val categoryId = restored?.optString("category") ?: todo?.optString("categoryId")
            setSelection((0 until categories.length()).firstOrNull { categories.getJSONObject(it).optString("id") == categoryId } ?: 0)
        }.also { add(it) }
        memoInput = field("메모", restored?.optString("memo") ?: todo?.optString("memo")?.takeUnless { it == "null" }.orEmpty(), 50_000, true)
        if (!memoInput?.text.isNullOrBlank()) { details.visibility = View.VISIBLE; toggle.text = "카테고리 · 메모 설정 접기" }
        fieldParent = null
        val chosen = categories.optJSONObject(categoryInput!!.selectedItemPosition)?.optString("name").orEmpty()
        val categorySummary = text("$chosen 카테고리에 저장 · 시간과 상세 설정은 필요할 때 변경하세요.", 13f)
        add(categorySummary)
        categoryInput!!.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                categorySummary.text = "${categories.optJSONObject(position)?.optString("name").orEmpty()} 카테고리에 저장 · 시간과 상세 설정은 필요할 때 변경하세요."
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
        saveButton = button("저장") { save() }.apply {
            val fill = palette.gold or 0xFF000000.toInt()
            setTextColor(if (androidx.core.graphics.ColorUtils.calculateContrast(Color.BLACK, fill) >= androidx.core.graphics.ColorUtils.calculateContrast(Color.WHITE, fill)) Color.BLACK else Color.WHITE)
            backgroundTintList = android.content.res.ColorStateList.valueOf(fill)
        }
        sheet.removeView(status); footer.addView(status)
        footer.addView(saveButton, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT)); footer.visibility = View.VISIBLE
        if (todo != null) {
            if (selected != null) add(button(if (selected.optBoolean("done")) "완료 취소" else "완료로 표시") { complete(selected, !selected.optBoolean("done")) })
            add(button(if (todo.optInt("repeat") > 0) "이 회차 삭제" else "할 일 삭제") { confirmDelete(todo, selected) })
        }
        initialDraft = restored?.optString("initial") ?: draft()
        if (restored != null) status.text = "작성 중인 내용을 복원했습니다."
    }
    override fun onSaveInstanceState(outState: Bundle) {
        outState.putString("day", day)
        if (initialDraft != null) outState.putString("form", JSONObject()
            .put("title", titleInput?.text.toString()).put("memo", memoInput?.text.toString())
            .put("category", categories.optJSONObject(categoryInput?.selectedItemPosition ?: -1)?.optString("id"))
            .put("allDay", allDayInput?.isChecked).put("start", start.timeInMillis).put("end", end.timeInMillis)
            .put("source", source).put("occurrence", occurrence).put("requestId", requestId).put("submitted", submittedPayload)
            .put("initial", initialDraft).toString())
        super.onSaveInstanceState(outState)
    }
    private fun draft() = listOf(titleInput?.text, memoInput?.text, categories.optJSONObject(categoryInput?.selectedItemPosition ?: -1)?.optString("id"), allDayInput?.isChecked, start.timeInMillis, end.timeInMillis).joinToString("\u0000")
    private fun leaveForm(leave: () -> Unit) {
        if (initialDraft != null && initialDraft != draft()) {
            AlertDialog.Builder(this).setTitle("변경 사항을 저장하지 않고 닫을까요?")
                .setNegativeButton("계속 작성", null).setPositiveButton("닫기") { _, _ -> initialDraft = null; leave() }.show()
        } else leave()
    }
    @Deprecated("The native sheet handles back navigation with draft protection")
    override fun onBackPressed() { if (!busy) leaveForm { finish() } else status.text = "처리 중입니다. 결과를 확인한 뒤 닫아 주세요." }
    private fun pickDay(calendar: Calendar, chosen: (Calendar) -> Unit) {
        DatePickerDialog(this, { _, y, m, d -> chosen((calendar.clone() as Calendar).apply { set(y, m, d) }) }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show()
    }
    private fun pickTime(calendar: Calendar, changed: () -> Unit) {
        TimePickerDialog(this, { _, h, m -> calendar.set(Calendar.HOUR_OF_DAY, h); calendar.set(Calendar.MINUTE, m); calendar.set(Calendar.SECOND, 0); calendar.set(Calendar.MILLISECOND, 0); changed() }, calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE), true).show()
    }
    private fun save() {
        val title = titleInput?.text.toString().trim()
        if (title.isEmpty()) { status.text = "제목을 입력해 주세요."; titleInput?.requestFocus(); return }
        val category = categories.optJSONObject(categoryInput?.selectedItemPosition ?: -1)
        if (category == null) { status.text = "사용 가능한 카테고리가 없습니다. 앱에서 카테고리를 만들어 주세요."; return }
        val a = start.clone() as Calendar; val b = end.clone() as Calendar
        if (allDayInput!!.isChecked) {
            a.set(Calendar.HOUR_OF_DAY, 0); a.set(Calendar.MINUTE, 0); a.set(Calendar.SECOND, 0); a.set(Calendar.MILLISECOND, 0)
            b.set(Calendar.HOUR_OF_DAY, 0); b.set(Calendar.MINUTE, 0); b.set(Calendar.SECOND, 0); b.set(Calendar.MILLISECOND, 0)
            b.add(Calendar.DAY_OF_MONTH, 1); b.add(Calendar.MILLISECOND, -1)
        }
        if (b.before(a)) { status.text = "종료 시간을 시작 시간 이후로 지정해 주세요."; return }
        val payload = JSONObject().put("title", title).put("categoryId", category.getString("id")).put("memo", memoInput?.text.toString()).put("startAt", iso(a)).put("endAt", iso(b)).put("isAllDay", allDayInput!!.isChecked)
        val id = formId
        if (id != null) payload.put("id", id)
        else {
            val fingerprint = payload.toString()
            if (submittedPayload != null && submittedPayload != fingerprint) requestId = java.util.UUID.randomUUID().toString()
            submittedPayload = fingerprint
            payload.put("requestId", requestId)
        }
        mutate { client.request(if (id == null) "POST" else "PATCH", "/api/widget/todo", payload) }
    }
    private fun complete(todo: JSONObject, done: Boolean) {
        val keys = if (!done) todo.optJSONArray("doneKeys") ?: JSONArray() else JSONArray()
        if (keys.length() == 0) keys.put(todo.optString("completionDate").ifBlank { day })
        mutate {
            for (i in 0 until keys.length()) {
                client.request("PATCH", "/api/widget/todo", JSONObject().put("id", todo.getString("id")).put("targetDate", keys.getString(i)).put("completed", done))
                // Each write commits independently; preserve refresh signalling if a later legacy key fails.
                runCatching { client.changed() }
            }
            JSONObject()
        }
    }
    private fun confirmDelete(todo: JSONObject, selected: JSONObject?) {
        val repeating = todo.optInt("repeat") > 0
        val key = selected?.optString("completionDate")?.takeIf { it.isNotBlank() } ?: day
        AlertDialog.Builder(this).setTitle(if (repeating) "$key 회차를 삭제할까요?" else "이 할 일을 삭제할까요?")
            .setMessage(if (repeating) "다른 날짜의 반복 일정은 유지됩니다." else todo.optString("title"))
            .setNegativeButton("취소", null).setPositiveButton("삭제") { _, _ ->
                mutate { client.request("DELETE", "/api/widget/todo?id=${client.query(todo.getString("id"))}" + if (repeating) "&targetDate=${client.query(key)}" else "") }
            }.show()
    }
    private fun mutate(write: () -> JSONObject) {
        if (busy) return
        request({
            write()
            runCatching { client.changed() }
            // A successful write must never become a failed form submission because refresh is offline.
            try { client.day(day) } catch (_: Exception) { JSONObject().put("savedWithoutRefresh", true) }
        }, { data ->
            initialDraft = null
            if (data.optBoolean("savedWithoutRefresh")) {
                header("저장 완료")
                status.text = "변경 사항을 저장했습니다. 목록을 새로 불러오면 위젯에도 반영됩니다."
                add(button("목록 새로 불러오기") { loadDay() })
            } else {
                items = data.optJSONArray("items") ?: JSONArray(); categories = data.optJSONArray("categories") ?: categories
                showDay(); status.text = "저장했습니다."
            }
        })
    }
    private fun request(work: () -> JSONObject, success: (JSONObject) -> Unit, failed: (Throwable) -> Unit = { status.text = message(it) }) {
        if (busy) return
        busy = true; status.text = "처리 중…"
        saveButton?.isEnabled = false; saveButton?.text = "저장 중…"
        fun enableFields(view: View, enabled: Boolean) {
            if (view is android.view.ViewGroup) for (i in 0 until view.childCount) enableFields(view.getChildAt(i), enabled)
            else if (view is EditText || view is Spinner || view is CheckBox) view.isEnabled = enabled
        }
        enableFields(sheet, false)
        val revision = ++generation
        thread(name = "cronos-widget-editor") {
            val result = runCatching(work)
            runOnUiThread {
                if (isFinishing || isDestroyed || revision != generation) return@runOnUiThread
                busy = false; enableFields(sheet, true)
                saveButton?.isEnabled = true; saveButton?.text = "저장"
                result.fold(success, failed)
            }
        }
    }
}
