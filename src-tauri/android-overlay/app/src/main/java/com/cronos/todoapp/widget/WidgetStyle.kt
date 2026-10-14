package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.BitmapShader
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffColorFilter
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.min

/**
 * 위젯 화가(WidgetPainter)가 쓰는 붓 한 벌 — 테마 갈래마다 하나.
 *
 * 위젯의 짜임(줄 목록·주간 띠·월간 격자·게이지)은 갈래가 달라도 같다. 다른 것은 글꼴과 장식이다:
 * Celestial 은 Orbit 글꼴에 별·달·금선 두 겹 테, Maple 은 고운바탕에 잎·먹 카드 테·단풍 가지·종이결,
 * Ocean 은 물빛과 빛 그물(OceanStyle). 그래서 짜임은 화가 하나가 그리고, 장식은 이 붓이 그린다.
 * 웹의 "공용 View + 갈래별 styles" 와 같은 나눔. 바탕 무늬는 데스크톱 위젯의 바탕 무늬(WidgetDecor)를 닮게 —
 * 홈 위젯은 멈춘 그림이라 움직임은 없다.
 *
 * 치수는 dp 로 받고, density 는 화가가 만든 붓에 들어 있다.
 */
abstract class WidgetStyle(protected val context: Context, protected val density: Float) {
    /** 제목·머리글 글꼴 */
    abstract val display: Typeface
    /** 숫자만 있는 글(D-12, 눈금 끝 숫자) 글꼴 */
    abstract val numeral: Typeface
    /** 제목의 자간(em). 라틴 대문자 글꼴은 벌리고, 한글 세리프는 좁힌다 */
    abstract val titleSpacing: Float

    /**
     * 칸이 판을 가득 채우는 위젯(월간·주간)인가 — 바탕의 큰 그림(가지 따위)을 줄인다. 날짜 숫자 뒤에 겹치면 읽기 어렵다.
     * 화가가 바탕(frame)을 그리기 전에 정한다.
     */
    var busy: Boolean = false

    protected fun dp(v: Float): Float = v * density

    protected fun stroke(color: Int, widthDp: Float) = Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color; style = Paint.Style.STROKE; strokeWidth = dp(widthDp) }
    protected fun fill(color: Int) = Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color; style = Paint.Style.FILL }

    /** res/drawable-nodpi 의 그림. 없으면(이름이 바뀌었거나 빠졌으면) null — 그 장식만 빠지고 위젯은 그려진다 */
    protected fun bmp(name: String): Bitmap? = try {
        val id = context.resources.getIdentifier(name, "drawable", context.packageName)
        if (id == 0) null else BitmapFactory.decodeResource(context.resources, id)
    } catch (e: Throwable) { null }

    /** 바탕의 둥근 네모 (테두리 선의 반 굵기만큼 들인다) */
    protected fun plate(w: Float, h: Float): RectF { val inset = dp(0.5f); return RectF(inset, inset, w - inset, h - inset) }
    protected fun rounded(rect: RectF, r: Float) = Path().apply { addRoundRect(rect, r, r, Path.Direction.CW) }

    /** 바탕: 둥근 네모와 테두리. alphaPct 는 위젯 설정의 바탕 불투명도(20..100) */
    abstract fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int)
    /** 줄 앞 표식·실선 끝 표식. Celestial 은 달(찬 점·빈 고리), Maple 은 잎, Ocean 은 물방울 */
    abstract fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float = 1f)
    /** ✦ 자리의 작은 문장. 왼쪽 x 와 세로 가운데를 받고, 그린 폭을 돌려준다 */
    abstract fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float
    /** 오늘 칸 표시 (주간·월간). 숫자 뒤·둘레에 그린다 */
    abstract fun todayMark(c: Canvas, cx: Float, cy: Float, rDp: Float, pal: Palette)
    /** 월 게이지의 바탕 반원 (눈금·바늘은 화가가 얹는다). 눈금 색을 돌려준다 */
    abstract fun gaugeBase(c: Canvas, cx: Float, cy: Float, r: Float, pal: Palette): Int
    /** 날짜 넘김 화살. cx 는 화살 끝(바깥쪽), right 면 오른쪽을 가리킨다 */
    abstract fun dayArrow(c: Canvas, cx: Float, cy: Float, sizeDp: Float, color: Int, right: Boolean)

    companion object {
        fun of(context: Context, family: String, density: Float): WidgetStyle =
            when (family) {
                "maple" -> MapleStyle(context, density)
                "ocean" -> OceanStyle(context, density)
                else -> CelestialStyle(context, density)
            }
    }
}

/**
 * 별·달의 꼴 — Celestial 의 말(직선·달·별·혼천의만, 마름모·사선 없음). 웹의 CelestialOrnaments 와 같은 곡선이다.
 */
object Sky {
    /** 네 갈래 별 — 네 꼭지가 오목하게 모인다 (웹 star4Path) */
    fun star4(cx: Float, cy: Float, r: Float): Path = Path().apply {
        moveTo(cx, cy - r)
        cubicTo(cx + 0.08f * r, cy - 0.24f * r, cx + 0.24f * r, cy - 0.08f * r, cx + r, cy)
        cubicTo(cx + 0.24f * r, cy + 0.08f * r, cx + 0.08f * r, cy + 0.24f * r, cx, cy + r)
        cubicTo(cx - 0.08f * r, cy + 0.24f * r, cx - 0.24f * r, cy + 0.08f * r, cx - r, cy)
        cubicTo(cx - 0.24f * r, cy - 0.08f * r, cx - 0.08f * r, cy - 0.24f * r, cx, cy - r)
        close()
    }

    /**
     * 위상(0 삭 · 0.25 상현 · 0.5 보름 · 0.75 하현)만큼 밝은 쪽 — 북반구에서 보는 대로(차오를 때 오른쪽이 밝다). 웹 litPath 와 같다.
     * 경계(터미네이터)는 가로 반지름 r·|cos 2πp| 의 타원 호. 삭이면 null.
     */
    fun lit(cx: Float, cy: Float, r: Float, phase: Float): Path? {
        val p = ((phase % 1f) + 1f) % 1f
        if (p < 0.005f || p > 0.995f) return null
        val circle = RectF(cx - r, cy - r, cx + r, cy + r)
        if (abs(p - 0.5f) < 0.005f) return Path().apply { addOval(circle, Path.Direction.CW) }
        val rx = r * abs(cos(2.0 * PI * p)).toFloat()
        val path = Path().apply { moveTo(cx, cy - r) }
        // 차오름은 오른쪽 반원, 이지러짐은 왼쪽 반원 (각은 동쪽 0°, 시계 방향 +)
        path.arcTo(circle, 270f, if (p < 0.5f) 180f else -180f)
        if (rx < 0.01f) path.lineTo(cx, cy - r)
        else {
            // 경계는 초승·그믐이면 밝은 쪽으로, 상현·하현을 넘어 둥글면 어두운 쪽으로 부푼다
            val bulgeRight = if (p < 0.5f) p < 0.25f else p < 0.75f
            path.arcTo(RectF(cx - rx, cy - r, cx + rx, cy + r), 90f, if (bulgeRight) -180f else 180f)
        }
        path.close()
        return path
    }
}

/**
 * Celestial — 금선 두 겹 테 안의 별하늘. 데스크톱 위젯(CelestialWidgetDecor)과 같은 말:
 * 옅은 별(작은 점), 겉테·속테, 속테 양옆 가운데의 네 갈래 별, 위 테에 꿴 달의 위상 줄.
 * 표식은 마름모 대신 달 — 끝낸 것은 찬 점(보름), 안 끝낸 것은 빈 고리(삭). 사선은 쓰지 않는다.
 */
open class CelestialStyle(context: Context, density: Float) : WidgetStyle(context, density) {
    override val display: Typeface = Fonts.orbit(context)
    override val numeral: Typeface = display
    override val titleSpacing = 0.2f

    override fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int) {
        val r = dp(WidgetPainter.RADIUS.toFloat())
        val rect = plate(w, h)
        val a = alphaPct / 100f
        c.drawRoundRect(rect, r, r, fill(Palette.withAlpha(pal.bg, a)))
        c.save()
        c.clipPath(rounded(rect, r))
        starfield(c, w, h, pal, a)
        c.restore()
        // 겉테와 4dp 안쪽의 더 옅은 속테 — 타로 카드의 두 겹 테
        c.drawRoundRect(rect, r, r, stroke(pal.line, 1f))
        val k = dp(4f)
        val inner = RectF(rect.left + k, rect.top + k, rect.right - k, rect.bottom - k)
        c.drawRoundRect(inner, r - k, r - k, stroke(Palette.withAlpha(pal.gold, if (pal.dark) 0.3f else 0.36f), 0.8f))
        // 속테 양옆 가운데에 꿴 네 갈래 별
        val star = fill(Palette.withAlpha(pal.gold, 0.9f))
        if (h >= dp(70f)) {
            c.drawPath(Sky.star4(inner.left, h / 2f, dp(3.4f)), star)
            c.drawPath(Sky.star4(inner.right, h / 2f, dp(3.4f)), star)
        }
        // 위 테 가운데에 꿴 달의 위상 줄 (★ ○◔◑◕●◕◑◔○ ★). 둥근 귀퉁이를 뺀 곧은 자리에만
        phaseStrip(c, w / 2f, inner.top, inner.width() - 2f * (r - k) - dp(6f), pal)
    }

    /** 옅은 별하늘 — 작은 점만(네 갈래 별을 흩으면 글 사이에서 표식처럼 읽힌다). 위젯 크기로 씨앗을 정해 다시 그려도 제자리 */
    private fun starfield(c: Canvas, w: Float, h: Float, pal: Palette, a: Float) {
        var seed = (w.toInt() * 73856093) xor (h.toInt() * 19349663) xor 0x5bd1e995
        fun rnd(): Float { seed = seed * 1103515245 + 12345; return ((seed ushr 8) and 0xFFFF) / 65535f }
        val n = ((w / density) * (h / density) / 620f).toInt().coerceIn(10, 110)
        val dot = fill(Palette.withAlpha(pal.gold, (if (pal.dark) 0.55f else 0.5f) * a))
        for (i in 0 until n) {
            val x = dp(7f) + rnd() * (w - dp(14f))
            val y = dp(7f) + rnd() * (h - dp(14f))
            val rr = if (i % 7 == 0) 0.85f + rnd() * 0.35f else 0.3f + rnd() * 0.42f
            c.drawCircle(x, y, dp(rr), dot)
        }
    }

    /** 달의 위상 줄 — 삭에서 보름을 지나 다시 삭으로, 양끝에 네 갈래 별. 자리(room)에 들어가는 만큼(9·7·5개) */
    private fun phaseStrip(c: Canvas, cx: Float, cy: Float, room: Float, pal: Palette) {
        val pr = dp(2.6f); val gap = dp(4.2f); val sr = dp(3.2f); val sg = dp(5f)
        val count = listOf(9, 7, 5).firstOrNull { n -> n * 2 * pr + (n - 1) * gap + 2 * (sg + 2 * sr) <= room } ?: return
        val stripW = count * 2 * pr + (count - 1) * gap
        val ring = stroke(Palette.withAlpha(pal.gold, 0.85f), 0.8f)
        val lit = fill(Palette.withAlpha(pal.gold, 0.85f))
        for (i in 0 until count) {
            val mx = cx - stripW / 2f + pr + i * (2 * pr + gap)
            c.drawCircle(mx, cy, pr, ring)
            Sky.lit(mx, cy, pr, i / (count - 1f))?.let { c.drawPath(it, lit) }
        }
        val star = fill(Palette.withAlpha(pal.gold, 0.9f))
        c.drawPath(Sky.star4(cx - stripW / 2f - sg - sr, cy, sr), star)
        c.drawPath(Sky.star4(cx + stripW / 2f + sg + sr, cy, sr), star)
    }

    override fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float) {
        // 찬 점(보름) — 끝낸 것, 빈 고리(삭) — 안 끝낸 것. 웹의 dotMark·ringMark 와 같은 말
        val r = dp(rDp) * 0.8f
        if (filled) c.drawCircle(cx, cy, r, fill(color)) else c.drawCircle(cx, cy, r, stroke(color, strokeDp))
    }

    override fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float {
        val s = dp(sizeDp)
        c.drawPath(Sky.star4(x + s / 2f, cy, s * 0.5f), fill(color))
        return s
    }

    override fun todayMark(c: Canvas, cx: Float, cy: Float, rDp: Float, pal: Palette) {
        // 금 고리와 그 바깥의 옅은 궤도, 궤도 위의 행성 하나 — 혼천의의 고리처럼
        val r = dp(rDp)
        val orbit = r + dp(2.4f)
        c.drawCircle(cx, cy, r, stroke(pal.gold, 1f))
        c.drawCircle(cx, cy, orbit, stroke(Palette.withAlpha(pal.gold, 0.35f), 0.6f))
        c.drawCircle(cx + orbit * 0.7071f, cy - orbit * 0.7071f, dp(1.3f), fill(pal.gold))
    }

    override fun dayArrow(c: Canvas, cx: Float, cy: Float, sizeDp: Float, color: Int, right: Boolean) {
        // 가는 꺾쇠 하나 — 앱의 달력 앞·뒤와 같은 말
        val s = dp(sizeDp)
        val dir = if (right) -1f else 1f
        val p = stroke(color, 1.2f).apply { strokeCap = Paint.Cap.ROUND; strokeJoin = Paint.Join.ROUND }
        c.drawPath(Path().apply {
            moveTo(cx + dir * s * 0.5f, cy - s * 0.5f)
            lineTo(cx - dir * s * 0.1f, cy)
            lineTo(cx + dir * s * 0.5f, cy + s * 0.5f)
        }, p)
    }

    override fun gaugeBase(c: Canvas, cx: Float, cy: Float, r: Float, pal: Palette): Int {
        val outer = RectF(cx - r, cy - r, cx + r, cy + r)
        c.drawArc(outer, 180f, 180f, false, stroke(Palette.withAlpha(pal.gold, if (pal.dark) 0.5f else 0.7f), 1f))
        val r2 = r * 0.56f
        c.drawArc(RectF(cx - r2, cy - r2, cx + r2, cy + r2), 180f, 180f, false, stroke(Palette.withAlpha(pal.gold, if (pal.dark) 0.28f else 0.4f), 1f))
        return pal.gold
    }
}

/**
 * Maple — 낡은 종이 위의 먹과 잎. 그림은 res/drawable-nodpi 의 maple_* (scripts/maple-assets.mjs 가 굽는다).
 * 바탕은 데스크톱 위젯(MapleWidgetDecor)과 같은 말: 종이결 위에 먹으로 그린 카드 테(네 귀퉁이에 잎)와
 * 오른쪽 아래 구석에서 들어오는 수채 단풍 가지 한 줄기(옅게).
 */
class MapleStyle(context: Context, density: Float) : WidgetStyle(context, density) {
    override val display: Typeface = Fonts.gowun(context)
    override val numeral: Typeface = Fonts.cormorant(context)
    override val titleSpacing = 0.06f

    private val leafFilled by lazy { bmp("maple_bullet_filled") }
    private val arrowLeft by lazy { bmp("maple_ink_arrow_left") }
    private val arrowRight by lazy { bmp("maple_ink_arrow_right") }
    private val leafOutline by lazy { bmp("maple_bullet_outline") }
    private val crest by lazy { bmp("maple_crest") }
    private val todayLeaf by lazy { bmp("maple_today_marker") }
    private val dial by lazy { bmp("maple_gauge_dial") }
    private val paperLight by lazy { bmp("maple_widget_paper_light") }
    private val paperDark by lazy { bmp("maple_widget_paper_dark") }
    private val cardFrame by lazy { bmp("maple_card_frame") }
    private val branch by lazy { bmp("maple_widget_branch") }

    /** 먹 마스크(검정+알파)에 색을 입혀 그린다 */
    private fun tinted(c: Canvas, b: Bitmap?, dst: RectF, color: Int) {
        if (b == null) return
        val p = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply { colorFilter = PorterDuffColorFilter(color, PorterDuff.Mode.SRC_IN) }
        c.drawBitmap(b, null, dst, p)
    }

    override fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int) {
        // 모서리는 Celestial 과 같이 둔다 — 런처가 위젯을 제 둥근 모서리로 자르므로 더 각지게 그리면 테두리가 잘린다
        val r = dp(WidgetPainter.RADIUS.toFloat())
        val rect = plate(w, h)
        val a = alphaPct / 100f
        val paper = if (pal.dark) paperDark else paperLight
        // 종이색을 먼저 깔고 그 위에 결(G1·G2)을 얹는다. 밝은 벌의 크라프트 타일은 앱의 크림보다 짙어 70% 만 섞는다
        c.drawRoundRect(rect, r, r, fill(Palette.withAlpha(pal.bg, a)))
        if (paper != null) {
            val shader = BitmapShader(paper, Shader.TileMode.MIRROR, Shader.TileMode.MIRROR)
            // 종이 타일은 384px 결을 2배로 구운 768px — 화면 밀도에 맞춰 원래 크기로 깐다
            shader.setLocalMatrix(Matrix().apply { setScale(density / 2f, density / 2f) })
            val mix = if (pal.dark) 1f else 0.7f
            c.drawRoundRect(rect, r, r, Paint(Paint.ANTI_ALIAS_FLAG).apply { this.shader = shader; alpha = (alphaPct * 255 / 100 * mix).toInt().coerceIn(0, 255) })
        }
        c.save()
        c.clipPath(rounded(rect, r))
        branch?.let { drawBranch(c, it, w, h, pal, a) }
        val card = cardFrame
        if (card != null) {
            // 먹으로 그린 카드 테 — 앱의 카드·데스크톱 위젯과 같은 그림을 9조각으로 늘린다(웹의 border-image 60 stretch)
            val k = dp(4f)
            val p = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply {
                colorFilter = PorterDuffColorFilter(pal.ink, PorterDuff.Mode.SRC_IN)
                alpha = ((if (pal.dark) 0.32f else 0.5f) * a * 255).toInt()
            }
            nineSlice(c, card, RectF(rect.left + k, rect.top + k, rect.right - k, rect.bottom - k), 60, dp(14f), p)
        }
        c.restore()
        // 먹 하이라인 테두리. 카드 테 그림이 없으면 그 안쪽의 옅은 선으로 — 색인 카드의 이중 괘선
        c.drawRoundRect(rect, r, r, stroke(pal.line, 1f))
        if (card == null) {
            val inner = RectF(rect.left + dp(3f), rect.top + dp(3f), rect.right - dp(3f), rect.bottom - dp(3f))
            c.drawRoundRect(inner, r - dp(3f), r - dp(3f), stroke(Palette.withAlpha(pal.ink, 0.12f), 1f))
        }
    }

    /** 오른쪽 아래 구석에서 비스듬히 들어오는 단풍 가지 — 데스크톱 위젯과 같은 자리·각(-16°). 칸이 가득한 위젯에서는 작고 옅게 */
    private fun drawBranch(c: Canvas, b: Bitmap, w: Float, h: Float, pal: Palette, a: Float) {
        val bh = if (busy) min(h * 0.46f, dp(190f)) else h * 0.82f
        val bw = bh * b.width / b.height
        val right = w + w * (if (busy) 0.03f else 0.06f)
        val bottom = h + h * (if (busy) 0.06f else 0.12f)
        val dst = RectF(right - bw, bottom - bh, right, bottom)
        val op = if (busy) 0.2f else if (pal.dark) 0.3f else 0.34f
        c.save()
        c.rotate(-16f, dst.left + bw * 0.85f, dst.bottom)
        c.drawBitmap(b, null, dst, Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply { alpha = (op * a * 255).toInt() })
        c.restore()
    }

    /** 9조각 늘이기 — 귀퉁이는 그대로, 변은 늘리고, 가운데는 비운다 */
    private fun nineSlice(c: Canvas, b: Bitmap, dst: RectF, slice: Int, border: Float, p: Paint) {
        val xs = intArrayOf(0, slice, b.width - slice, b.width)
        val ys = intArrayOf(0, slice, b.height - slice, b.height)
        val xd = floatArrayOf(dst.left, dst.left + border, dst.right - border, dst.right)
        val yd = floatArrayOf(dst.top, dst.top + border, dst.bottom - border, dst.bottom)
        for (i in 0..2) for (j in 0..2) {
            if (i == 1 && j == 1) continue
            c.drawBitmap(b, Rect(xs[i], ys[j], xs[i + 1], ys[j + 1]), RectF(xd[i], yd[j], xd[i + 1], yd[j + 1]), p)
        }
    }

    override fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float) {
        val r = dp(rDp) * 1.35f
        tinted(c, if (filled) leafFilled else leafOutline, RectF(cx - r, cy - r, cx + r, cy + r), color)
    }

    override fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float {
        val s = dp(sizeDp)
        tinted(c, crest, RectF(x, cy - s / 2f, x + s, cy + s / 2f), color)
        return s
    }

    override fun todayMark(c: Canvas, cx: Float, cy: Float, rDp: Float, pal: Palette) {
        val r = dp(rDp) * 1.5f
        val p = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply { alpha = if (pal.dark) 170 else 255 }
        val b = todayLeaf ?: return c.drawCircle(cx, cy, dp(rDp), stroke(pal.gold, 1f))
        c.drawBitmap(b, null, RectF(cx - r, cy - r, cx + r, cy + r), p)
    }

    override fun dayArrow(c: Canvas, cx: Float, cy: Float, sizeDp: Float, color: Int, right: Boolean) {
        // 먹 화살(J8) — 그림은 가로로 길다(384×91). 자리는 꺾쇠와 같은 폭(sizeDp*2)이라 높이는 비율대로 낮다
        val w = dp(sizeDp) * 2f
        val h = w * 91f / 384f
        val left = if (right) cx - w else cx
        tinted(c, if (right) arrowRight else arrowLeft, RectF(left, cy - h / 2f, left + w, cy + h / 2f), color)
    }

    override fun gaugeBase(c: Canvas, cx: Float, cy: Float, r: Float, pal: Palette): Int {
        val b = dial
        if (b == null) {
            c.drawArc(RectF(cx - r, cy - r, cx + r, cy + r), 180f, 180f, false, stroke(pal.line, 1f))
            return pal.ink
        }
        // 놋쇠판(1024×475)에서 잰 반원: 중심 (512, 452), 가로 반지름 497, 세로 437 — 화가의 반지름 r 에 맞춘다
        val k = r / 497f
        val left = cx - 512f * k
        val top = cy - 452f * k
        val dst = RectF(left, top, left + 1024f * k, top + 475f * k)
        val p = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply { if (pal.dark) alpha = 215 }
        c.drawBitmap(b, null, dst, p)
        return pal.ink
    }

}
