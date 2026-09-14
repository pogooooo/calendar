package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Typeface
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import android.text.TextUtils
import java.util.Calendar
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/**
 * Celestial 테마의 위젯 화가 — 위젯 한 종류를 그림(Bitmap) 한 장으로 그린다.
 *
 * 홈 위젯(RemoteViews)은 TextView·ImageView 정도만 실을 수 있고 글꼴도 시스템 것뿐이다.
 * 그래서 앱 화면과 같은 말(Orbit 글꼴·마름모·금빛 실선·반원 눈금)을 내려면 앱이 그림으로
 * 그려서 ImageView 에 얹는 수밖에 없다. 누르는 자리는 그림 위에 투명한 칸(widget_canvas.xml)을
 * 겹쳐 두는데, 그 칸의 위치는 여기의 치수(PAD·HDR_H·ROW_H)와 같아야 한다.
 *
 * 치수는 전부 dp 로 적고 그릴 때 density 를 곱한다. 갈래(Maple 등)가 늘면 이 클래스를 하나 더.
 */
class CelestialPainter(
    context: Context,
    private val pal: Palette,
    /** 바탕 불투명도 20..100 */
    private val alphaPct: Int,
    private val snap: Snapshot?,
    private val now: Long = System.currentTimeMillis(),
) {
    class Painted(
        val bitmap: Bitmap,
        /** 줄 목록형 위젯: 줄마다 누르면 갈 링크 (없으면 root 로) */
        val rowLinks: List<String?> = emptyList(),
        /** 주간 7칸 / 월간 42칸 */
        val cellLinks: List<String?> = emptyList(),
        val overlay: Overlay = Overlay.NONE,
        /** 월간: 이 달이 몇 줄인가 (5 또는 6). 겹칸의 여섯째 줄을 숨길지 정한다 */
        val monthRows: Int = 6,
    )
    enum class Overlay { NONE, ROWS, WEEK, MONTH }

    // 그림의 해상도. 너무 크면 런처에 넘길 때 무겁다 — 2x 면 충분히 또렷하다
    private val density: Float = min(context.resources.displayMetrics.density, 2.0f)
    private val orbit: Typeface = Fonts.orbit(context)
    private val sans: Typeface = Typeface.SANS_SERIF
    private val sansMedium: Typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)

    private fun dp(v: Float): Float = v * density
    private fun dp(v: Int): Float = v * density

    // ── 공통 치수 (dp) — widget_canvas.xml 의 겹칸과 같아야 한다 ──
    companion object {
        const val PAD_X = 14
        const val PAD_T = 12
        const val PAD_B = 12
        /** 머리글(제목 + 밑줄) 높이. 내용은 PAD_T + HDR_H 부터 */
        const val HDR_H = 26
        const val ROW_H = 26
        /** 월간의 요일 이름 줄 */
        const val NAMES_H = 16
        const val RADIUS = 18
        const val MAX_ROWS = 6
        private val ROMAN = arrayOf("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII")
    }

    fun paint(kind: String, wDp: Int, hDp: Int): Painted {
        val w = dp(wDp).toInt().coerceAtLeast(1)
        val h = dp(hDp).toInt().coerceAtLeast(1)
        val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val c = Canvas(bmp)
        frame(c, w.toFloat(), h.toFloat())
        val s = snap ?: run { emptyState(c, w.toFloat(), h.toFloat(), kind); return Painted(bmp) }
        return when (kind) {
            "today" -> today(c, s, w.toFloat(), h.toFloat(), bmp)
            "nownext" -> nowNext(c, s, w.toFloat(), h.toFloat(), bmp)
            "challenge" -> challenge(c, s, w.toFloat(), h.toFloat(), bmp)
            "monthgauge" -> monthGauge(c, s, w.toFloat(), h.toFloat(), bmp)
            "week" -> week(c, s, w.toFloat(), h.toFloat(), bmp)
            "month" -> month(c, s, w.toFloat(), h.toFloat(), bmp)
            "anniversary" -> anniversary(c, s, w.toFloat(), h.toFloat(), bmp)
            "dayprogress" -> dayProgress(c, s, w.toFloat(), h.toFloat(), bmp)
            "quickadd" -> quickAdd(c, s, w.toFloat(), h.toFloat(), bmp)
            "memo" -> memo(c, s, w.toFloat(), h.toFloat(), bmp)
            "project" -> project(c, s, w.toFloat(), h.toFloat(), bmp)
            else -> Painted(bmp)
        }
    }

    // ── 붓 ──────────────────────────────────────────────────────────
    private fun text(sizeDp: Float, color: Int, tf: Typeface = sans, spacingEm: Float = 0f, tabular: Boolean = false): TextPaint =
        TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
            textSize = dp(sizeDp); this.color = color; typeface = tf; letterSpacing = spacingEm
            if (tabular) fontFeatureSettings = "tnum"
        }
    private fun title() = text(11f, pal.goldText, orbit, 0.2f)
    private fun sub() = text(10f, pal.muted, orbit, 0.14f, tabular = true)
    private fun kicker() = text(9.5f, pal.goldText, orbit, 0.24f)
    private fun body(color: Int = pal.ink) = text(12.5f, color)
    private fun side(color: Int = pal.muted) = text(11f, color, tabular = true)
    private fun stroke(color: Int, widthDp: Float) = Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color; style = Paint.Style.STROKE; strokeWidth = dp(widthDp) }
    private fun fill(color: Int) = Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color; style = Paint.Style.FILL }

    /** 글자를 세로 가운데에 놓을 때의 baseline */
    private fun baseline(p: Paint, cy: Float): Float { val fm = p.fontMetrics; return cy - (fm.ascent + fm.descent) / 2f }
    private fun ellipsize(s: String, p: TextPaint, maxW: Float): String =
        if (maxW <= 0) "" else TextUtils.ellipsize(s, p, maxW, TextUtils.TruncateAt.END).toString()
    private fun drawRight(c: Canvas, s: String, right: Float, y: Float, p: Paint) { c.drawText(s, right - p.measureText(s), y, p) }
    private fun drawCenter(c: Canvas, s: String, cx: Float, y: Float, p: Paint) { c.drawText(s, cx - p.measureText(s) / 2f, y, p) }

    private fun diamond(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float = 1f) {
        val r = dp(rDp)
        val path = Path().apply { moveTo(cx, cy - r); lineTo(cx + r, cy); lineTo(cx, cy + r); lineTo(cx - r, cy); close() }
        c.drawPath(path, if (filled) fill(color) else stroke(color, strokeDp))
    }

    /** 진행 실선: 바탕선 + 금빛 채움 + 마름모 표식 */
    private fun rail(c: Canvas, x0: Float, x1: Float, y: Float, frac: Float, mark: Boolean = true) {
        c.drawLine(x0, y, x1, y, stroke(pal.line, 1f))
        val f = frac.coerceIn(0f, 1f)
        if (f <= 0f) return
        val xe = x0 + (x1 - x0) * f
        c.drawLine(x0, y, xe, y, stroke(pal.gold, 1.2f))
        if (mark) diamond(c, xe, y, 3.5f, pal.gold, true)
    }

    /** 바탕: 둥근 네모 + 금빛 테두리 + 왼쪽 위 귀퉁이 표식 */
    private fun frame(c: Canvas, w: Float, h: Float) {
        val r = dp(RADIUS)
        val inset = dp(0.5f)
        val rect = RectF(inset, inset, w - inset, h - inset)
        val bg = fill(Palette.withAlpha(pal.bg, alphaPct / 100f))
        c.drawRoundRect(rect, r, r, bg)
        c.drawRoundRect(rect, r, r, stroke(pal.line, 1f))
        // 귀퉁이 표식 — 앱의 알림 패널과 같은 말
        c.save()
        c.clipPath(Path().apply { addRoundRect(rect, r, r, Path.Direction.CW) })
        c.drawLine(dp(1f), dp(13f), dp(13f), dp(1f), stroke(Palette.withAlpha(pal.gold, 0.9f), 1f))
        c.restore()
    }

    /** 머리글: 제목(금, Orbit) + 오른쪽 보조 글 + 밑줄. 내용 시작 y 를 돌려준다 */
    private fun header(c: Canvas, w: Float, titleText: String, subText: String? = null, subAccent: String? = null, divider: Boolean = true): Float {
        val top = dp(PAD_T)
        val cy = top + dp(9f)
        val tp = title()
        val titleShown = ellipsize(titleText, tp, w - dp(2 * PAD_X))
        c.drawText(titleShown, dp(PAD_X), baseline(tp, cy), tp)
        if (subText != null) {
            // 좁은 위젯에서는 제목과 겹치지 않게 — 날짜를 버리고 숫자만, 그것도 안 들어가면 아무것도
            val sp = sub()
            val ap = sub().apply { color = pal.goldText }
            val avail = w - dp(2 * PAD_X) - tp.measureText(titleShown) - dp(8f)
            val accentW = if (subAccent != null) ap.measureText(subAccent) else 0f
            val showText = sp.measureText(subText) + accentW <= avail
            val showAccent = subAccent != null && accentW <= avail
            var right = w - dp(PAD_X)
            if (showAccent) {
                drawRight(c, subAccent!!, right, baseline(ap, cy), ap)
                right -= accentW
            }
            if (showText) drawRight(c, subText, right, baseline(sp, cy), sp)
        }
        if (divider) {
            val y = top + dp(HDR_H) - dp(4f)
            c.drawLine(dp(PAD_X), y, w - dp(PAD_X), y, stroke(pal.line, 1f))
        }
        return top + dp(HDR_H)
    }

    private fun emptyState(c: Canvas, w: Float, h: Float, kind: String) {
        val tp = title()
        c.drawText("CRONOS", dp(PAD_X), baseline(tp, dp(PAD_T) + dp(9f)), tp)
        val bp = body(pal.muted)
        c.drawText("—", dp(PAD_X), baseline(bp, h / 2f), bp)
    }

    private fun maxRows(h: Float, footDp: Int): Int =
        floor(((h - dp(PAD_T) - dp(HDR_H) - dp(footDp) - dp(PAD_B)) / dp(ROW_H)).toDouble()).toInt().coerceIn(0, MAX_ROWS)

    // ── I. 오늘 할 일 ─────────────────────────────────────────────
    private fun today(c: Canvas, s: Snapshot, w: Float, h: Float, bmp: Bitmap): Painted {
        val key = s.todayKey(now)
        val rows = s.todos.filter { it.spans(key) }.sortedWith(compareBy({ it.done }, { !it.allDay }, { it.start }))
        val done = rows.count { it.done }
        val total = rows.size
        val y0 = header(c, w, s.label("today"), s.formatDate(now) + "  ", if (total > 0) "$done/$total" else null)

        val n = min(rows.size, maxRows(h, 20))
        val links = ArrayList<String?>()
        if (rows.isEmpty()) {
            val bp = body(pal.muted)
            c.drawText(ellipsize(s.label("noTodayTodos"), bp, w - dp(2 * PAD_X)), dp(PAD_X), baseline(bp, y0 + dp(14f)), bp)
        }
        for (i in 0 until n) {
            val t = rows[i]
            val cy = y0 + dp(ROW_H) * i + dp(ROW_H) / 2f
            diamond(c, dp(PAD_X) + dp(4f), cy, 3.5f, t.color, t.done)
            val sp = side(if (t.done) Palette.withAlpha(pal.muted, 0.7f) else pal.muted)
            val sideText = if (t.allDay) s.label("allDay") else t.timeRange()
            val sideW = sp.measureText(sideText)
            drawRight(c, sideText, w - dp(PAD_X), baseline(sp, cy), sp)
            val bp = body(if (t.done) pal.muted else pal.ink)
            val x = dp(PAD_X) + dp(16f)
            val maxW = w - dp(PAD_X) - sideW - dp(8f) - x
            val txt = ellipsize(t.title, bp, maxW)
            c.drawText(txt, x, baseline(bp, cy), bp)
            if (t.done) c.drawLine(x, cy, x + bp.measureText(txt), cy, stroke(Palette.withAlpha(pal.gold, 0.8f), 1f))
            links += "cronos://todo/${t.id}?date=$key"
        }
        // 바닥: 진행 실선 + 남은/끝낸
        val ry = h - dp(PAD_B) - dp(12f)
        rail(c, dp(PAD_X), w - dp(PAD_X), ry, if (total > 0) done.toFloat() / total else 0f, mark = total > 0)
        val fp = text(9f, pal.muted, orbit, 0.1f, tabular = true)
        val fy = h - dp(PAD_B) + dp(1f)
        c.drawText("${s.label("left")} ${total - done}", dp(PAD_X), fy, fp)
        val star = text(9f, pal.gold)
        val doneText = " ${s.label("done")} $done"
        drawRight(c, doneText, w - dp(PAD_X), fy, fp)
        drawRight(c, "✦", w - dp(PAD_X) - fp.measureText(doneText), fy, star)
        return Painted(bmp, rowLinks = links, overlay = Overlay.ROWS)
    }

    // ── II. 지금 · 다음 ───────────────────────────────────────────
    private fun nowNext(c: Canvas, s: Snapshot, w: Float, h: Float, bmp: Bitmap): Painted {
        val timed = s.todos.filter { !it.allDay && !it.done }
        val current = timed.filter { it.start <= now && now < it.end }.minByOrNull { it.end }
        val next = timed.filter { it.start > now }.minByOrNull { it.start }
        val x0 = dp(PAD_X); val x1 = w - dp(PAD_X)
        var y = dp(PAD_T) + dp(6f)

        val kp = kicker()
        val bigP = text(15f, pal.ink, sansMedium)
        if (current != null) {
            c.drawText("${s.label("now")} · ${current.timeRange()}", x0, baseline(kp, y), kp)
            y += dp(17f)
            c.drawText(ellipsize(current.title, bigP, x1 - x0), x0, baseline(bigP, y), bigP)
            y += dp(15f)
            val frac = ((now - current.start).toFloat() / (current.end - current.start).coerceAtLeast(1)).coerceIn(0f, 1f)
            rail(c, x0, x1, y, frac)
            y += dp(11f)
            val mp = text(11f, pal.muted, tabular = true)
            val elapsed = ((now - current.start) / 60000L).toInt()
            val left = ((current.end - now + 59999L) / 60000L).toInt()
            c.drawText(s.fmt("elapsedMin", "n" to elapsed), x0, baseline(mp, y), mp)
            val lp = text(11f, pal.goldText, sansMedium, tabular = true)
            drawRight(c, s.fmt("leftMin", "n" to left), x1, baseline(lp, y), lp)
            y += dp(11f)
        } else {
            c.drawText(s.label("now"), x0, baseline(kp, y), kp)
            y += dp(17f)
            val ep = text(15f, pal.muted)
            c.drawText(ellipsize(s.label("nothingNow"), ep, x1 - x0), x0, baseline(ep, y), ep)
            y += dp(15f)
            c.drawLine(x0, y, x1, y, stroke(pal.line, 1f))
            y += dp(22f)
        }
        // 점선 아래 "다음"
        c.drawLine(x0, y, x1, y, stroke(pal.line, 1f).apply { pathEffect = DashPathEffect(floatArrayOf(dp(3f), dp(3f)), 0f) })
        val cy = y + dp(14f)
        if (next != null) {
            diamond(c, x0 + dp(4f), cy, 3.5f, next.color, false)
            val when_ = untilText(s, next.start)
            val sp = side()
            val sideText = "$when_ · ${Snapshot.hhmm(next.start)}"
            drawRight(c, sideText, x1, baseline(sp, cy), sp)
            c.drawText(s.label("next"), x0 + dp(16f), baseline(kp, cy), kp)
            val kx = x0 + dp(16f) + kp.measureText(s.label("next")) + dp(6f)
            val bp = body()
            c.drawText(ellipsize(next.title, bp, x1 - sp.measureText(sideText) - dp(8f) - kx), kx, baseline(bp, cy), bp)
        } else {
            diamond(c, x0 + dp(4f), cy, 3.5f, pal.muted, false)
            c.drawText(s.label("next"), x0 + dp(16f), baseline(kp, cy), kp)
            val sp = side()
            drawRight(c, s.label("nothingNext"), x1, baseline(sp, cy), sp)
        }
        return Painted(bmp)
    }

    /** "32분 뒤" / "1시간 53분 뒤" / "내일" */
    private fun untilText(s: Snapshot, at: Long): String {
        val mins = ((at - now) / 60000L).toInt()
        val todayKey = s.todayKey(now)
        return when {
            Snapshot.dayKey(at) != todayKey -> if (Snapshot.dayKey(at) == Snapshot.dayKey(now + Snapshot.DAY_MS)) s.label("tomorrow") else s.formatDate(at)
            mins < 60 -> s.fmt("inMin", "n" to max(mins, 0))
            else -> s.fmt("inHourMin", "h" to mins / 60, "m" to mins % 60)
        }
    }

    // ── III. 챌린지 ───────────────────────────────────────────────
    private fun challenge(c: Canvas, s: Snapshot, w: Float, h: Float, bmp: Bitmap): Painted {
        val items = s.challenges
        val leftToday = items.count { !it.doneToday }
        val y0 = header(c, w, s.label("challenge"), s.label("todayLeft") + " ", if (items.isNotEmpty()) "$leftToday" else null)
        val n = min(items.size, maxRows(h, 0))
        if (items.isEmpty()) {
            val bp = body(pal.muted)
            c.drawText(ellipsize(s.label("noChallenges"), bp, w - dp(2 * PAD_X)), dp(PAD_X), baseline(bp, y0 + dp(14f)), bp)
        }
        val links = ArrayList<String?>()
        for (i in 0 until n) {
            val ch = items[i]
            val top = y0 + dp(ROW_H) * i
            val cy = top + dp(10f)
            val cntP = side()
            val accent = text(11f, pal.goldText, sansMedium, tabular = true)
            val countText = "${ch.count}"
            val restText = if (ch.target != null) "/${ch.target}" else ""
            var right = w - dp(PAD_X)
            if (restText.isNotEmpty()) { drawRight(c, restText, right, baseline(cntP, cy), cntP); right -= cntP.measureText(restText) }
            drawRight(c, countText, right, baseline(accent, cy), accent)
            right -= accent.measureText(countText)
            val bp = body()
            val starW = if (ch.doneToday) text(10f, pal.gold).measureText(" ✦") else 0f
            val txt = ellipsize(ch.title, bp, right - dp(8f) - dp(PAD_X) - starW)
            c.drawText(txt, dp(PAD_X), baseline(bp, cy), bp)
            if (ch.doneToday) c.drawText(" ✦", dp(PAD_X) + bp.measureText(txt), baseline(bp, cy), text(10f, pal.gold))
            // 진행선
            val by = top + dp(ROW_H) - dp(4f)
            c.drawLine(dp(PAD_X), by, w - dp(PAD_X), by, stroke(pal.line, 1f))
            val frac = if (ch.target != null && ch.target > 0) (ch.count.toFloat() / ch.target).coerceIn(0f, 1f) else 1f
            c.drawLine(dp(PAD_X), by, dp(PAD_X) + (w - dp(2 * PAD_X)) * frac, by, stroke(if (ch.target != null) pal.gold else Palette.withAlpha(pal.gold, 0.35f), 2f))
            links += "cronos://challenge"
        }
        return Painted(bmp, rowLinks = links, overlay = Overlay.ROWS)
    }

    // ── IV. 월 게이지 ─────────────────────────────────────────────
    private fun monthGauge(c: Canvas, s: Snapshot, w: Float, h: Float, bmp: Bitmap): Painted {
        val cal = Calendar.getInstance().apply { timeInMillis = now }
        val days = cal.getActualMaximum(Calendar.DAY_OF_MONTH)
        val today = cal.get(Calendar.DAY_OF_MONTH)
        val monthIdx = cal.get(Calendar.MONTH)
        val footH = dp(14f)
        val cx = w / 2f
        val cy = h - dp(PAD_B) - footH - dp(4f)
        val R = min(w / 2f - dp(PAD_X) - dp(4f), cy - dp(PAD_T) - dp(2f))
        // 바깥·안쪽 호
        val outer = RectF(cx - R, cy - R, cx + R, cy + R)
        c.drawArc(outer, 180f, 180f, false, stroke(Palette.withAlpha(pal.gold, if (pal.dark) 0.5f else 0.7f), 1f))
        val r2 = R * 0.56f
        c.drawArc(RectF(cx - r2, cy - r2, cx + r2, cy + r2), 180f, 180f, false, stroke(Palette.withAlpha(pal.gold, if (pal.dark) 0.28f else 0.4f), 1f))
        // 눈금 — 하루에 하나, 5일마다 길게. 지난 날은 진하게
        for (d in 0..days) {
            val a = PI - PI * d / days
            val long = d % 5 == 0
            val r1 = R - dp(if (long) 12f else 7f); val rr = R - dp(1.5f)
            val op = if (d <= today) (if (long) 0.9f else 0.6f) else (if (long) 0.45f else 0.25f)
            c.drawLine(cx + (cos(a) * r1).toFloat(), cy - (sin(a) * r1).toFloat(), cx + (cos(a) * rr).toFloat(), cy - (sin(a) * rr).toFloat(),
                stroke(Palette.withAlpha(pal.gold, op), if (long) 1.2f else 0.8f))
        }
        // 바늘
        val a = PI - PI * today / days
        val nr = R - dp(18f)
        val nx = cx + (cos(a) * nr).toFloat(); val ny = cy - (sin(a) * nr).toFloat()
        c.drawLine(cx, cy, nx, ny, stroke(pal.gold, 1.2f))
        diamond(c, nx, ny, 4f, pal.gold, false, 1.2f)
        diamond(c, cx, cy, 4f, pal.gold, true)
        val ep = text(8f, pal.muted, orbit, 0f, tabular = true)
        c.drawText("1", cx - R - dp(2f), cy + dp(3f), ep)
        drawRight(c, "$days", cx + R + dp(3f), cy + dp(3f), ep)
        // 바닥 글: 로마 숫자 달 · 요약 · 오늘
        val monthTodos = s.todos.filter { it.start <= monthEnd(cal) && it.end >= monthStart(cal) }
        val done = monthTodos.count { it.done }
        val left = monthTodos.count { !it.done && it.end >= Snapshot.startOfDay(now) }
        val fp = text(9.5f, pal.muted, orbit, 0.18f, tabular = true)
        val fy = h - dp(PAD_B) + dp(1f)
        c.drawText(ROMAN[monthIdx], dp(PAD_X), fy, fp)
        drawRight(c, "$today", w - dp(PAD_X), fy, fp)
        val mid = text(9.5f, pal.goldText, orbit, 0.18f, tabular = true)
        val summary = "✦ " + s.fmt("gaugeSummary", "month" to s.formatDate(now, "monthFmt", "MMM"), "left" to left, "done" to done) + " ✦"
        drawCenter(c, ellipsize(summary, mid, w - dp(2 * PAD_X) - dp(40f)), cx, fy, mid)
        return Painted(bmp)
    }
    private fun monthStart(cal: Calendar): Long = (cal.clone() as Calendar).apply { set(Calendar.DAY_OF_MONTH, 1); set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0) }.timeInMillis
    private fun monthEnd(cal: Calendar): Long = (cal.clone() as Calendar).apply { set(Calendar.DAY_OF_MONTH, getActualMaximum(Calendar.DAY_OF_MONTH)); set(Calendar.HOUR_OF_DAY, 23); set(Calendar.MINUTE, 59); set(Calendar.SECOND, 59); set(Calendar.MILLISECOND, 999) }.timeInMillis

    // ── V. 주간 띠 ────────────────────────────────────────────────
    private fun week(c: Canvas, s: Snapshot, w: Float, h: Float, bmp: Bitmap): Painted {
        val start = Calendar.getInstance().apply {
            timeInMillis = Snapshot.startOfDay(now)
            add(Calendar.DAY_OF_YEAR, -(get(Calendar.DAY_OF_WEEK) - Calendar.SUNDAY))
        }
        val dayKeys = (0 until 7).map { i -> Snapshot.dayKey(start.timeInMillis + i * Snapshot.DAY_MS) }
        val perDay = dayKeys.map { k -> s.todos.filter { it.spans(k) } }
        val total = s.todos.count { t -> dayKeys.any { t.spans(it) } }
        val y0 = header(c, w, s.label("thisWeek"), s.formatDate(now, "monthFmt", "MMM") + " · " + s.label("events") + " ", "$total")
        val cellW = (w - dp(2 * PAD_X)) / 7f
        val top = y0; val bottom = h - dp(PAD_B)
        val todayKey = s.todayKey(now)
        val names = text(8.5f, pal.muted, orbit, 0.1f)
        val dayNames = SHORT_DAYS(s)
        val links = ArrayList<String?>()
        for (i in 0 until 7) {
            val x = dp(PAD_X) + cellW * i; val cx = x + cellW / 2f
            val isToday = dayKeys[i] == todayKey
            val weekend = i == 0 || i == 6
            drawCenter(c, dayNames[i], cx, baseline(names, top + dp(8f)), names)
            val np = text(13f, if (isToday) pal.goldText else if (weekend) pal.weekend else pal.ink, tabular = true)
            val ny = top + dp(8f) + (bottom - dp(12f) - top - dp(8f)) / 2f
            val cal = Calendar.getInstance().apply { timeInMillis = start.timeInMillis + i * Snapshot.DAY_MS }
            drawCenter(c, "${cal.get(Calendar.DAY_OF_MONTH)}", cx, baseline(np, ny), np)
            if (isToday) c.drawCircle(cx, ny, dp(11f), stroke(pal.gold, 1f))
            // 점: 일정 하나에 하나, 셋 넘으면 +N
            val items = perDay[i]
            val dots = min(items.size, 3)
            val extra = items.size - dots
            val ep = text(8f, pal.muted, tabular = true)
            val dotW = dp(7f) * dots + (if (extra > 0) ep.measureText("+$extra") + dp(2f) else 0f)
            var dx = cx - dotW / 2f + dp(3f)
            val dy = bottom - dp(6f)
            for (j in 0 until dots) { diamond(c, dx, dy, 2.2f, items[j].color, true); dx += dp(7f) }
            if (extra > 0) c.drawText("+$extra", dx - dp(1f), baseline(ep, dy), ep)
            links += "cronos://day/${dayKeys[i]}"
        }
        return Painted(bmp, cellLinks = links, overlay = Overlay.WEEK)
    }
    private fun SHORT_DAYS(s: Snapshot): List<String> {
        val cal = Calendar.getInstance().apply { set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY) }
        val fmt = java.text.SimpleDateFormat("EEEEE", s.locale)
        return (0 until 7).map { i -> (cal.clone() as Calendar).apply { add(Calendar.DAY_OF_YEAR, i) }.let { fmt.format(it.time) } }
    }

    // ── VI. 월간 달력 ─────────────────────────────────────────────
    private fun month(c: Canvas, s: Snapshot, w: Float, h: Float, bmp: Bitmap): Painted {
        val cal = Calendar.getInstance().apply { timeInMillis = now }
        val days = cal.getActualMaximum(Calendar.DAY_OF_MONTH)
        val first = (cal.clone() as Calendar).apply { set(Calendar.DAY_OF_MONTH, 1) }
        val firstDow = first.get(Calendar.DAY_OF_WEEK) - Calendar.SUNDAY // 0..6
        val year = cal.get(Calendar.YEAR)
        val ms = monthStart(cal); val me = monthEnd(cal)
        val monthTodos = s.todos.filter { it.start <= me && it.end >= ms }
        val y0 = header(c, w, s.formatDate(now, "monthFmt", "MMM"), "$year · " + s.label("events") + " ", "${monthTodos.size}")
        val cellW = (w - dp(2 * PAD_X)) / 7f
        val names = text(8f, pal.muted, orbit, 0.08f)
        val dayNames = SHORT_DAYS(s)
        for (i in 0 until 7) drawCenter(c, dayNames[i], dp(PAD_X) + cellW * i + cellW / 2f, baseline(names, y0 + dp(NAMES_H) / 2f), names)
        val gridTop = y0 + dp(NAMES_H)
        // 5주짜리 달은 다섯 줄로 나눠 빈 줄이 남지 않게 (겹칸도 여섯째 줄을 숨긴다)
        val rowsNeeded = if (firstDow + days > 35) 6 else 5
        val cellH = (h - dp(PAD_B) - gridTop) / rowsNeeded
        val todayKey = s.todayKey(now)
        val np = text(11.5f, pal.ink, tabular = true)
        val links = ArrayList<String?>()
        for (cell in 0 until 42) {
            val d = cell - firstDow + 1
            if (d < 1 || d > days) { links += null; continue }
            val col = cell % 7; val row = cell / 7
            val cx = dp(PAD_X) + cellW * col + cellW / 2f
            val cy = gridTop + cellH * row + cellH / 2f - dp(2f)
            val key = String.format(java.util.Locale.US, "%04d-%02d-%02d", year, cal.get(Calendar.MONTH) + 1, d)
            val isToday = key == todayKey
            val weekend = col == 0 || col == 6
            val p = TextPaint(np).apply { color = if (isToday) pal.goldText else if (weekend) pal.weekend else pal.ink }
            drawCenter(c, "$d", cx, baseline(p, cy), p)
            if (isToday) c.drawCircle(cx, cy, dp(9.5f), stroke(pal.gold, 1f))
            val items = monthTodos.filter { it.spans(key) }
            val dots = min(items.size, 3)
            var dx = cx - dp(5f) * (dots - 1) / 2f
            for (j in 0 until dots) { diamond(c, dx, cy + dp(10f), 1.8f, items[j].color, true); dx += dp(5f) }
            links += "cronos://day/$key"
        }
        return Painted(bmp, cellLinks = links, overlay = Overlay.MONTH, monthRows = rowsNeeded)
    }

    // ── VII. 기념일 ───────────────────────────────────────────────
    private fun anniversary(c: Canvas, s: Snapshot, w: Float, h: Float, bmp: Bitmap): Painted {
        val upcoming = s.anniversaries.sortedBy { it.daysUntilNext(now) }
        val wide = w >= dp(200f)
        if (upcoming.isEmpty()) {
            val y0 = header(c, w, s.label("anniversary"))
            val bp = body(pal.muted)
            c.drawText(ellipsize(s.label("noAnniversaries"), bp, w - dp(2 * PAD_X)), dp(PAD_X), baseline(bp, y0 + dp(14f)), bp)
            return Painted(bmp)
        }
        val first = upcoming[0]
        val dLeft = first.daysUntilNext(now)
        val dText = if (dLeft == 0) s.label("dToday") else s.fmt("dday", "n" to dLeft)
        if (!wide) {
            header(c, w, s.label("anniversary"), s.formatDate(first.nextDate(now), "shortDate", "M·d"), divider = false)
            val cx = w / 2f
            val bigP = text(26f, pal.goldText, orbit, 0.08f)
            val cy = h / 2f - dp(6f)
            val bw = bigP.measureText(dText)
            c.drawText(dText, cx - bw / 2f, baseline(bigP, cy), bigP)
            diamond(c, cx - bw / 2f - dp(10f), cy, 3f, pal.gold, false)
            diamond(c, cx + bw / 2f + dp(10f), cy, 3f, pal.gold, false)
            val np = text(12.5f, pal.ink, sansMedium)
            val nameY = cy + dp(21f)
            val iconW = dp(14f)
            val name = ellipsize(first.title, np, w - dp(2 * PAD_X) - iconW)
            val nw = np.measureText(name) + iconW
            icon(c, first.icon, cx - nw / 2f + dp(5f), nameY - dp(4f), dp(5.5f), pal.goldText)
            c.drawText(name, cx - nw / 2f + iconW, baseline(np, nameY), np)
            val dp2 = text(9f, pal.muted, orbit, 0.16f)
            drawCenter(c, s.formatDate(first.nextDate(now)), cx, baseline(dp2, nameY + dp(14f)), dp2)
            rail(c, dp(PAD_X), w - dp(PAD_X), h - dp(PAD_B) - dp(2f), 1f - dLeft / 365f)
            return Painted(bmp)
        }
        val y0 = header(c, w, s.label("anniversary"), s.label("upcoming") + " ", "${upcoming.size}")
        val colW = (w - dp(2 * PAD_X)) * 0.45f
        val x0 = dp(PAD_X)
        val bigP = text(24f, pal.goldText, orbit, 0.08f)
        val cy = y0 + (h - dp(PAD_B) - y0) / 2f
        c.drawText(ellipsize(dText, bigP, colW), x0, baseline(bigP, cy - dp(12f)), bigP)
        val np = text(12.5f, pal.ink, sansMedium)
        icon(c, first.icon, x0 + dp(5f), cy + dp(7f), dp(5.5f), pal.goldText)
        c.drawText(ellipsize(first.title, np, colW - dp(14f)), x0 + dp(14f), baseline(np, cy + dp(9f)), np)
        val dp2 = text(9f, pal.muted, orbit, 0.14f)
        c.drawText(ellipsize(s.formatDate(first.nextDate(now)), dp2, colW), x0, baseline(dp2, cy + dp(23f)), dp2)
        // 세로 실선
        val vx = x0 + colW + dp(10f)
        c.drawLine(vx, y0 + dp(4f), vx, h - dp(PAD_B) - dp(4f), stroke(pal.line, 1f))
        // 오른쪽 목록: 다가오는 것 다음 둘, 모자라면 최근 지난 것으로
        val rest = ArrayList<Pair<Snapshot.Anniversary, Int>>()
        for (a in upcoming.drop(1)) rest += a to a.daysUntilNext(now)
        if (rest.size < 3) for (a in s.anniversaries.sortedBy { it.daysSinceLast(now) }) {
            if (a === first || rest.any { it.first === a }) continue
            if (a.daysSinceLast(now) in 1..60) rest += a to -a.daysSinceLast(now)
            if (rest.size >= 3) break
        }
        val listX = vx + dp(10f)
        val rows = min(rest.size, floor(((h - dp(PAD_B) - y0) / dp(22f)).toDouble()).toInt())
        val listTop = cy - rows * dp(22f) / 2f
        for (i in 0 until rows) {
            val (a, d) = rest[i]
            val rcy = listTop + dp(22f) * i + dp(11f)
            val ddP = text(10f, if (d < 0) pal.muted else pal.goldText, orbit, 0.12f, tabular = true)
            val ddText = if (d < 0) s.fmt("dPast", "n" to -d) else if (d == 0) s.label("dToday") else s.fmt("dday", "n" to d)
            c.drawText(ddText, listX, baseline(ddP, rcy), ddP)
            val ix = listX + dp(36f)
            icon(c, a.icon, ix + dp(5f), rcy - dp(0.5f), dp(5f), if (d < 0) pal.muted else pal.goldText)
            val bp = text(12f, if (d < 0) pal.muted else pal.ink)
            c.drawText(ellipsize(a.title, bp, w - dp(PAD_X) - ix - dp(14f)), ix + dp(14f), baseline(bp, rcy), bp)
        }
        return Painted(bmp)
    }

    /** 기념일 아이콘 (AnniversaryIcons 의 키). 선 하나로 작게 */
    private fun icon(c: Canvas, key: String, cx: Float, cy: Float, r: Float, color: Int) {
        val p = stroke(color, 1f)
        when (key) {
            "ring" -> { c.drawCircle(cx, cy + r * 0.25f, r * 0.75f, p); diamond(c, cx, cy - r * 0.75f, r * 0.3f / density, color, false) }
            "cake" -> {
                c.drawRoundRect(RectF(cx - r * 0.9f, cy - r * 0.1f, cx + r * 0.9f, cy + r * 0.9f), r * 0.2f, r * 0.2f, p)
                c.drawLine(cx, cy - r * 0.1f, cx, cy - r * 0.6f, p); c.drawCircle(cx, cy - r * 0.85f, r * 0.15f, fill(color))
            }
            "heart" -> {
                val path = Path().apply {
                    moveTo(cx, cy + r * 0.9f)
                    cubicTo(cx - r * 1.6f, cy - r * 0.2f, cx - r * 0.6f, cy - r * 1.2f, cx, cy - r * 0.3f)
                    cubicTo(cx + r * 0.6f, cy - r * 1.2f, cx + r * 1.6f, cy - r * 0.2f, cx, cy + r * 0.9f)
                    close()
                }
                c.drawPath(path, p)
            }
            "moon" -> {
                val path = Path().apply {
                    addArc(RectF(cx - r, cy - r, cx + r, cy + r), 60f, 240f)
                    arcTo(RectF(cx - r * 0.55f, cy - r, cx + r * 1.05f, cy + r), 300f, -240f)
                }
                c.drawPath(path, p)
            }
            "flower" -> { for (k in 0 until 5) { val a = PI * 2 * k / 5 - PI / 2; c.drawCircle(cx + (cos(a) * r * 0.6f).toFloat(), cy + (sin(a) * r * 0.6f).toFloat(), r * 0.38f, p) }; c.drawCircle(cx, cy, r * 0.22f, fill(color)) }
            "candle" -> { c.drawRect(cx - r * 0.3f, cy - r * 0.2f, cx + r * 0.3f, cy + r, p); c.drawLine(cx, cy - r * 0.2f, cx, cy - r * 0.55f, p); c.drawCircle(cx, cy - r * 0.8f, r * 0.18f, fill(color)) }
            "gift" -> { c.drawRect(cx - r * 0.9f, cy - r * 0.3f, cx + r * 0.9f, cy + r * 0.9f, p); c.drawLine(cx - r * 0.9f, cy - r * 0.3f, cx + r * 0.9f, cy - r * 0.3f, p); c.drawLine(cx, cy - r * 0.9f, cx, cy + r * 0.9f, p) }
            else -> { // star — 앱의 네 갈래 별
                val path = Path().apply {
                    moveTo(cx, cy - r); cubicTo(cx, cy - r * 0.2f, cx, cy - r * 0.2f, cx + r, cy)
                    cubicTo(cx, cy + r * 0.2f, cx, cy + r * 0.2f, cx, cy + r)
                    cubicTo(cx, cy + r * 0.2f, cx, cy + r * 0.2f, cx - r, cy)
                    cubicTo(cx, cy - r * 0.2f, cx, cy - r * 0.2f, cx, cy - r); close()
                }
                c.drawPath(path, p)
            }
        }
    }

    // ── VIII. 하루 진행 ───────────────────────────────────────────
    private fun dayProgress(c: Canvas, s: Snapshot, w: Float, h: Float, bmp: Bitmap): Painted {
        val key = s.todayKey(now)
        val rows = s.todos.filter { it.spans(key) }
        val done = rows.count { it.done }; val total = rows.size
        val dayFrac = ((now - Snapshot.startOfDay(now)).toFloat() / Snapshot.DAY_MS).coerceIn(0f, 1f)
        val doneFrac = if (total > 0) done.toFloat() / total else 0f
        val wide = w >= dp(150f)
        val rOut = if (wide) dp(27f) else dp(22f)
        val cx = if (wide) dp(PAD_X) + rOut + dp(2f) else w / 2f
        val cy = if (wide) h / 2f else dp(PAD_T) + rOut + dp(2f)
        fun ring(r: Float, widthDp: Float, frac: Float, baseAlpha: Float) {
            c.drawCircle(cx, cy, r, stroke(Palette.withAlpha(pal.gold, baseAlpha), widthDp))
            if (frac > 0f) c.drawArc(RectF(cx - r, cy - r, cx + r, cy + r), -90f, 360f * frac, false, stroke(pal.gold, widthDp))
        }
        ring(rOut, 1.5f, dayFrac, 0.25f)
        ring(rOut * 0.74f, 3f, doneFrac, 0.2f)
        diamond(c, cx, cy, 4f, pal.gold, true)
        val kp = text(9f, pal.goldText, orbit, 0.2f)
        val vp = text(16f, pal.ink, sansMedium, tabular = true)
        val mp = text(10f, pal.muted, tabular = true)
        val time = Snapshot.hhmm(now)
        if (wide) {
            val tx = cx + rOut + dp(12f)
            c.drawText(s.label("dayProgress"), tx, baseline(kp, cy - dp(16f)), kp)
            c.drawText("$done / $total", tx, baseline(vp, cy), vp)
            c.drawText("$time · ${(dayFrac * 100).toInt()}%", tx, baseline(mp, cy + dp(16f)), mp)
        } else {
            val ty = cy + rOut + dp(12f)
            drawCenter(c, "$done / $total", cx, baseline(vp, ty), vp)
            drawCenter(c, "$time · ${(dayFrac * 100).toInt()}%", cx, baseline(mp, ty + dp(14f)), mp)
        }
        return Painted(bmp)
    }

    // ── IX. 빠른 추가 ─────────────────────────────────────────────
    private fun quickAdd(c: Canvas, s: Snapshot, w: Float, h: Float, bmp: Bitmap): Painted {
        val key = s.todayKey(now)
        val left = s.todos.count { it.spans(key) && !it.done }
        val cy = h / 2f
        val plus = dp(30f)
        val px = w - dp(PAD_X) - plus
        c.drawRoundRect(RectF(px, cy - plus / 2f, px + plus, cy + plus / 2f), dp(8f), dp(8f), stroke(pal.gold, 1f))
        val pp = text(18f, pal.goldText, orbit)
        drawCenter(c, "+", px + plus / 2f, baseline(pp, cy), pp)
        var fieldRight = px - dp(10f)
        if (w >= dp(200f)) {
            val cp = text(10f, pal.muted, orbit, 0.14f, tabular = true)
            val ap = text(10f, pal.goldText, orbit, 0.14f, tabular = true)
            drawRight(c, "$left", fieldRight, baseline(ap, cy), ap)
            fieldRight -= ap.measureText("$left")
            val lbl = s.label("todayLeft") + " "
            drawRight(c, lbl, fieldRight, baseline(cp, cy), cp)
            fieldRight -= cp.measureText(lbl) + dp(10f)
        }
        val field = RectF(dp(PAD_X), cy - dp(15f), fieldRight, cy + dp(15f))
        c.drawRoundRect(field, dp(10f), dp(10f), stroke(pal.line, 1f))
        diamond(c, field.left + dp(12f), cy, 3.5f, pal.gold, false)
        val bp = text(12f, pal.muted)
        c.drawText(ellipsize(s.label("quickAdd"), bp, field.width() - dp(30f)), field.left + dp(22f), baseline(bp, cy), bp)
        return Painted(bmp)
    }

    // ── X. 오늘 메모 ──────────────────────────────────────────────
    private fun memo(c: Canvas, s: Snapshot, w: Float, h: Float, bmp: Bitmap): Painted {
        val y0 = header(c, w, s.label("memo"), s.formatDate(now))
        val memoText = s.memo.trim()
        val empty = memoText.isEmpty()
        c.drawLine(dp(PAD_X) + dp(0.5f), y0 + dp(4f), dp(PAD_X) + dp(0.5f), h - dp(PAD_B) - dp(2f), stroke(if (empty) Palette.withAlpha(pal.gold, 0.4f) else pal.gold, 1f))
        val tp = text(12f, if (empty) pal.muted else pal.ink)
        val x = dp(PAD_X) + dp(11f)
        val width = (w - dp(PAD_X) - x).toInt().coerceAtLeast(10)
        val avail = h - dp(PAD_B) - y0 - dp(2f)
        val lineH = tp.fontMetrics.let { it.descent - it.ascent } * 1.35f
        val maxLines = floor((avail / lineH).toDouble()).toInt().coerceAtLeast(1)
        val shown = if (empty) s.label("noMemo") else memoText
        val layout = StaticLayout.Builder.obtain(shown, 0, shown.length, tp, width)
            .setAlignment(Layout.Alignment.ALIGN_NORMAL).setLineSpacing(0f, 1.35f).setMaxLines(maxLines).setEllipsize(TextUtils.TruncateAt.END).build()
        c.save(); c.translate(x, y0 + dp(2f)); layout.draw(c); c.restore()
        return Painted(bmp)
    }

    // ── XI. 프로젝트 ──────────────────────────────────────────────
    private fun project(c: Canvas, s: Snapshot, w: Float, h: Float, bmp: Bitmap): Painted {
        val items = s.projects
        val y0 = header(c, w, s.label("project"), s.label("inProgress") + " ", if (items.isNotEmpty()) "${items.size}" else null)
        val n = min(items.size, maxRows(h, 0))
        if (items.isEmpty()) {
            val bp = body(pal.muted)
            c.drawText(ellipsize(s.label("noProjects"), bp, w - dp(2 * PAD_X)), dp(PAD_X), baseline(bp, y0 + dp(14f)), bp)
        }
        val links = ArrayList<String?>()
        for (i in 0 until n) {
            val p = items[i]
            val top = y0 + dp(ROW_H) * i
            val cy = top + dp(10f)
            val dl = p.daysLeft(now)
            val ddText = when { dl == null -> "—"; dl < 0 -> s.fmt("dPast", "n" to -dl); dl == 0 -> s.label("dToday"); else -> s.fmt("dday", "n" to dl) }
            val ddP = text(10f, if (dl == null || dl < 0) pal.muted else pal.goldText, orbit, 0.12f, tabular = true)
            var right = w - dp(PAD_X)
            drawRight(c, ddText, right, baseline(ddP, cy), ddP)
            right -= ddP.measureText(ddText) + dp(8f)
            val cp = text(9.5f, pal.muted, tabular = true)
            val cnt = "${p.done}/${p.total}"
            drawRight(c, cnt, right, baseline(cp, cy), cp)
            right -= cp.measureText(cnt) + dp(8f)
            val bp = body()
            c.drawText(ellipsize(p.title, bp, right - dp(PAD_X)), dp(PAD_X), baseline(bp, cy), bp)
            val by = top + dp(ROW_H) - dp(4f)
            c.drawLine(dp(PAD_X), by, w - dp(PAD_X), by, stroke(pal.line, 1f))
            val frac = if (p.total > 0) (p.done.toFloat() / p.total).coerceIn(0f, 1f) else 0f
            if (frac > 0f) c.drawLine(dp(PAD_X), by, dp(PAD_X) + (w - dp(2 * PAD_X)) * frac, by, stroke(pal.gold, 2f))
            links += "cronos://project/${p.id}"
        }
        return Painted(bmp, rowLinks = links, overlay = Overlay.ROWS)
    }
}

/** Orbit(OFL) — 앱의 표시 글꼴. assets/fonts 에 동봉 */
object Fonts {
    @Volatile private var orbit: Typeface? = null
    fun orbit(context: Context): Typeface = orbit ?: synchronized(this) {
        orbit ?: (try { Typeface.createFromAsset(context.assets, "fonts/Orbit-Regular.ttf") } catch (e: Throwable) { Typeface.SANS_SERIF }).also { orbit = it }
    }
}
