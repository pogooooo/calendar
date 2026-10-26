package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorFilter
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RadialGradient
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

    /**
 * 위젯 화가(WidgetPainter)가 쓰는 붓 한 벌 — 테마 갈래마다 하나.
 *
 * 위젯의 짜임(줄 목록·주간 띠·월간 격자·게이지)은 갈래가 달라도 같다. 다른 것은 글꼴과 장식이다:
 * Celestial 은 Orbit 글꼴에 별·달·금선 두 겹 테, Maple 은 고운바탕에 벡터 잎·선 잎·따뜻한 빛,
 * Ocean 은 물빛과 빛 그물(OceanStyle — 앱의 물과 같은 식). 그래서 짜임은 화가 하나가 그리고, 장식은 이 붓이 그린다.
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

    /** 그리는 위젯의 종류 — 바탕 무늬를 종류마다 조금 달리 그릴 때(같은 종류는 늘 같은 무늬). 화가가 정한다 */
    var kind: String = ""

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


    /**
     * 기념일까지의 고리 — frac 은 지난 기념일에서 지금까지 온 만큼(0..1, 1 이면 오늘). 고리 안쪽은 비워 둔다(화가가 D-day 를 얹는다).
     * 갈래마다 꼴이 다르다: Celestial 은 열두 달 눈금의 궤도와 지금 자리의 초승달, Maple 은 단풍잎 화환(지나온 만큼 물든다),
     * Ocean 은 물 고리와 방울. 기본은 옅은 원 위의 진한 호.
     */
    open fun countdownRing(c: Canvas, cx: Float, cy: Float, r: Float, frac: Float, pal: Palette) {
        c.drawCircle(cx, cy, r, stroke(Palette.withAlpha(pal.gold, 0.22f), 2f))
        if (frac > 0f) c.drawArc(RectF(cx - r, cy - r, cx + r, cy + r), -90f, 360f * frac.coerceAtMost(1f), false,
            stroke(pal.gold, 2f).apply { strokeCap = Paint.Cap.ROUND })
    }

    companion object {
        fun of(context: Context, family: String, density: Float): WidgetStyle =
            when (family) {
                "maple" -> MapleStyle(context, density)
                "ocean" -> OceanStyle(context, density)
                "gem" -> GemStyle(context, density)
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

    override fun countdownRing(c: Canvas, cx: Float, cy: Float, r: Float, frac: Float, pal: Palette) {
        // 궤도 — 옅은 금선 원에 열두 달 눈금, 지나온 만큼 진한 호, 맨 위(지난 기념일)에 네 갈래 별, 지금 자리에 초승달
        c.drawCircle(cx, cy, r, stroke(Palette.withAlpha(pal.gold, if (pal.dark) 0.3f else 0.34f), 1f))
        val tick = stroke(Palette.withAlpha(pal.gold, 0.55f), 0.9f)
        for (i in 1 until 12) {
            val a = -PI / 2 + 2 * PI * i / 12
            val ca = cos(a).toFloat(); val sa = kotlin.math.sin(a).toFloat()
            c.drawLine(cx + ca * (r - dp(2.2f)), cy + sa * (r - dp(2.2f)), cx + ca * (r + dp(2.2f)), cy + sa * (r + dp(2.2f)), tick)
        }
        val f = frac.coerceIn(0f, 1f)
        if (f > 0f) c.drawArc(RectF(cx - r, cy - r, cx + r, cy + r), -90f, 360f * f, false, stroke(pal.gold, 1.6f))
        c.drawPath(Sky.star4(cx, cy - r, dp(3.4f)), fill(pal.gold))
        if (f in 0.02f..0.98f) {
            val a = -PI / 2 + 2 * PI * f
            val mx = cx + cos(a).toFloat() * r; val my = cy + kotlin.math.sin(a).toFloat() * r
            val mr = dp(3.6f)
            c.drawCircle(mx, my, mr + dp(1.2f), fill(pal.bg))
            c.drawCircle(mx, my, mr, stroke(pal.gold, 0.9f))
            Sky.lit(mx, my, mr, 0.32f)?.let { c.drawPath(it, fill(pal.gold)) }
        }
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
 * Maple — 단풍. 데스크톱 위젯(MapleWidgetDecor·paintDapple)과 같은 말: 카드색 판에 옅은 선 테두리, 위에서 비치는 따뜻한 빛
 * (오른쪽 위 호박빛·왼쪽 아래 단풍빛), 그 위로 단풍 그늘(단풍잎을 지나온 물든 빛과 옅은 그늘 — 또렷한 잎은 글 위에 두지 않는다).
 * 잎은 앱과 같은 수채 단풍 넷(res 의 maple_leaf_*, 192px)을 흐려 쓴다. 표식(글머리·문장)은 또렷한 벡터 잎이다.
 * 2026-10-16: 오른쪽 아래의 수채 가지가 글을 덮어("위젯의 단풍이 내용을 가리는데") 단풍 그늘로.
 * 2026-10-15: 종이결 타일·먹 카드 테·먹 화살·놋쇠 계기판 그림은 걷고, 단풍 느낌은 수채 잎 가지로 (사용자: "단풍 테마가 단풍의 느낌이 없는데").
 */
class MapleStyle(context: Context, density: Float) : WidgetStyle(context, density) {
    /** 제목은 고운바탕을 굵게(굵은 글꼴 파일은 싣지 않는다 — 안드로이드가 굵기를 지어 낸다), 숫자는 산세리프 굵게 */
    override val display: Typeface = Typeface.create(Fonts.gowun(context), Typeface.BOLD)
    override val numeral: Typeface = Typeface.create("sans-serif", Typeface.BOLD)
    override val titleSpacing = 0.01f

    /** 호박빛 — 앱의 accent. 팔레트에는 강조색(단풍 붉음) 하나뿐이라 여기 둔다 */
    private fun amber(pal: Palette): Int = if (pal.dark) 0xFFE8B567.toInt() else if (pal.vintage) 0xFFBB9150.toInt() else 0xFFE2A54D.toInt()

    /**
     * 빈티지 벌의 바랜 톤 — 앱의 AGED_TONE(styles/vintage.ts: sepia 0.5 · saturate 0.74)과 같은 행렬.
     * 잎 그림의 색 행렬 뒤에 이어 곱한다(postConcat — 먼저 물들이고 그다음 바랜다)
     */
    private val aged: ColorMatrix by lazy {
        val k = 0.5f
        ColorMatrix(floatArrayOf(
            0.393f + 0.607f * (1 - k), 0.769f - 0.769f * (1 - k), 0.189f - 0.189f * (1 - k), 0f, 0f,
            0.349f - 0.349f * (1 - k), 0.686f + 0.314f * (1 - k), 0.168f - 0.168f * (1 - k), 0f, 0f,
            0.272f - 0.272f * (1 - k), 0.534f - 0.534f * (1 - k), 0.131f + 0.869f * (1 - k), 0f, 0f,
            0f, 0f, 0f, 1f, 0f,
        )).apply { postConcat(ColorMatrix().apply { setSaturation(0.74f) }) }
    }
    private fun leafTone(m: ColorMatrix, pal: Palette): ColorMatrixColorFilter =
        ColorMatrixColorFilter(if (pal.vintage) ColorMatrix(m).apply { postConcat(aged) } else m)

    override fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int) {
        val r = dp(WidgetPainter.RADIUS.toFloat())
        val rect = plate(w, h)
        val a = alphaPct / 100f
        c.drawRoundRect(rect, r, r, fill(Palette.withAlpha(pal.bg, a)))
        c.save()
        c.clipPath(rounded(rect, r))
        // 따뜻한 빛 두 군데 (데스크톱의 .light)
        val far = hypot(w, h)
        glow(c, w, 0f, far * 0.6f, Palette.withAlpha(amber(pal), (if (pal.dark) 0.1f else 0.2f) * a))
        glow(c, 0f, h, far * 0.5f, Palette.withAlpha(pal.gold, (if (pal.dark) 0.08f else 0.07f) * a))
        dapple(c, w, h, pal, a)
        c.restore()
        c.drawRoundRect(rect, r, r, stroke(pal.line, 1f))
    }

    private fun glow(c: Canvas, x: Float, y: Float, radius: Float, color: Int) {
        c.drawCircle(x, y, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(x, y, radius, color, Palette.withAlpha(color, 0f), Shader.TileMode.CLAMP)
        })
    }

    /** 수채 잎 넷 — 붉음·주황·노랑·갈빛 (없으면 그 잎만 빠진다) */
    private val leafArt by lazy { listOf("maple_leaf_red", "maple_leaf_orange", "maple_leaf_yellow", "maple_leaf_brown").map { bmp(it) } }

    /** 붉음·주황이 많고 노랑·갈빛이 조금 (데스크톱의 pickImg 와 같다) */
    private fun pick(v: Float): Int = if (v < 0.36f) 0 else if (v < 0.68f) 1 else if (v < 0.88f) 2 else 3

    /**
     * 단풍 그늘 — 위젯 위로 단풍나무가 드리워 있다고 치고, 그 잎을 지나온 햇빛이 종이에 떨어진 모습(데스크톱의 paintDapple 과 같은 말).
     * 또렷한 잎은 두지 않는다 — 2026-10-16 "위젯의 단풍이 내용을 가린다": 구석의 수채 가지가 시각·D-day 같은 글을 덮었다.
     * 흐린 단풍잎 꼴의 물든 빛과 옅은 그늘만, 해와 나무가 있는 오른쪽 위에 짙게(어긋난 격자로 판을 고르게 덮는다).
     * 어두운 벌은 그늘이 보이지 않으므로 빛만 조금 밝게. 칸이 판을 채우는 위젯(busy)은 더 옅게. 위젯 종류마다 잎의 자리·빛깔이 다르다.
     */
    private fun dapple(c: Canvas, w: Float, h: Float, pal: Palette, a: Float) {
        var seed = kind.hashCode() xor 0x5d2a91c3
        fun rnd(): Float { seed = seed * 1103515245 + 12345; return ((seed ushr 8) and 0xFFFF) / 65535f }
        val short = min(w, h); val long = max(w, h)
        val k = (if (busy) 0.6f else 1f) * a
        val cell = (short * 0.46f).coerceIn(dp(64f), dp(150f))
        val cols = ceil(w / cell).toInt() + 1; val rows = ceil(h / cell).toInt() + 1
        data class S(val x: Float, val y: Float, val near: Float, val size: Float, val rot: Float, val img: Int, val shade: Boolean,
                     val hue: Float, val sat: Float, val light: Float, val flip: Boolean)
        val spots = ArrayList<S>()
        for (gy in 0 until rows) for (gx in 0 until cols) {
            val x = (gx - 0.2f + rnd() * 0.85f) * cell
            val y = (gy - 0.2f + rnd() * 0.85f) * cell
            val d = hypot((w - x) / long, (y / long) * 1.2f)
            spots += S(x, y, max(0f, 1f - d), cell * (0.95f + rnd() * 0.55f), rnd() * 360f, pick(rnd()), rnd() < 0.42f,
                -14f + rnd() * 22f, 1f + rnd() * 0.2f, 0.95f + rnd() * 0.15f, rnd() < 0.5f)
        }
        // 그늘 — 잎이 해를 가린 자리 (밝은 종이에서만)
        if (!pal.dark) {
            val shade = leafTone(tone(-10f, 1.15f, 0.5f), pal)
            for (s in spots) if (s.shade) drawSoft(c, s.img, s.x, s.y, s.size, s.rot, s.flip, shade, (0.022f + 0.06f * s.near) * k)
        }
        // 물든 빛 — 붉은·주황 잎을 지나온 햇빛
        for (s in spots) {
            if (s.shade && !pal.dark) continue
            val f = leafTone(tone(s.hue, s.sat, if (pal.dark) s.light * 1.15f else s.light), pal)
            drawSoft(c, s.img, s.x, s.y, s.size, s.rot, s.flip, f, (if (pal.dark) 0.045f + 0.11f * s.near else 0.06f + 0.17f * s.near) * k)
        }
    }

    /** 흐린 잎 넷 — 잎 그림을 64px 로 줄여 둘레를 비우고(80px 판) 상자 흐림을 세 번(잎 크기의 5% 남짓) */
    private val softLeaves by lazy { leafArt.map { it?.let(::soften) } }

    private fun soften(b: Bitmap): Bitmap? = try {
        val inner = 64; val n = 80; val pad = (n - inner) / 2
        val src = Bitmap.createBitmap(n, n, Bitmap.Config.ARGB_8888)
        Canvas(src).drawBitmap(Bitmap.createScaledBitmap(b, inner, inner, true), pad.toFloat(), pad.toFloat(), Paint(Paint.FILTER_BITMAP_FLAG))
        val px = IntArray(n * n); src.getPixels(px, 0, n, 0, 0, n, n)
        // 미리 곱한 값으로 흐린다 — 투명한 둘레의 검은 색이 번지지 않게
        val ch = Array(4) { FloatArray(n * n) }
        for (i in px.indices) {
            val al = ((px[i] ushr 24) and 255) / 255f
            ch[0][i] = al
            ch[1][i] = ((px[i] shr 16) and 255) / 255f * al
            ch[2][i] = ((px[i] shr 8) and 255) / 255f * al
            ch[3][i] = (px[i] and 255) / 255f * al
        }
        repeat(3) { for (cc in ch) { boxBlur(cc, n, 3, true); boxBlur(cc, n, 3, false) } }
        for (i in px.indices) {
            val al = ch[0][i]
            val inv = if (al > 0.0001f) 1f / al else 0f
            fun q(v: Float) = (v * 255f).toInt().coerceIn(0, 255)
            px[i] = (q(al) shl 24) or (q(ch[1][i] * inv) shl 16) or (q(ch[2][i] * inv) shl 8) or q(ch[3][i] * inv)
        }
        Bitmap.createBitmap(px, n, n, Bitmap.Config.ARGB_8888)
    } catch (e: Throwable) { null }

    /** 한 방향 상자 흐림(반지름 r) — 가장자리는 0 으로 친다 */
    private fun boxBlur(v: FloatArray, n: Int, r: Int, horizontal: Boolean) {
        val out = FloatArray(n)
        val span = 2 * r + 1
        for (line in 0 until n) {
            fun at(i: Int): Float = if (i < 0 || i >= n) 0f else if (horizontal) v[line * n + i] else v[i * n + line]
            var sum = 0f
            for (i in -r..r) sum += at(i)
            for (i in 0 until n) {
                out[i] = sum / span
                sum += at(i + r + 1) - at(i - r)
            }
            for (i in 0 until n) if (horizontal) v[line * n + i] = out[i] else v[i * n + line] = out[i]
        }
    }

    /** 흐린 잎 한 장을 가운데 (x, y) 에 — size 는 잎 그림의 한 변(둘레 빈칸 빼고), rotDeg 만큼 돌려 */
    private fun drawSoft(c: Canvas, img: Int, x: Float, y: Float, size: Float, rotDeg: Float, flip: Boolean, filter: ColorFilter, alpha: Float) {
        val b = softLeaves.getOrNull(img) ?: return
        val s = size / 64f
        val m = Matrix().apply {
            postTranslate(-b.width / 2f, -b.height / 2f)
            postScale(if (flip) -s else s, s)
            postRotate(rotDeg)
            postTranslate(x, y)
        }
        c.drawBitmap(b, m, Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply {
            colorFilter = filter
            this.alpha = (alpha * 255).toInt().coerceIn(0, 255)
        })
    }

    /** CSS 의 hue-rotate → saturate → brightness 와 같은 색 행렬 (데스크톱의 캔버스 필터와 빛깔을 맞춘다) */
    private fun tone(hueDeg: Float, sat: Float, bright: Float): ColorMatrix {
        val rad = Math.toRadians(hueDeg.toDouble())
        val cs = cos(rad).toFloat(); val sn = kotlin.math.sin(rad).toFloat()
        val hm = floatArrayOf(
            0.213f + cs * 0.787f - sn * 0.213f, 0.715f - cs * 0.715f - sn * 0.715f, 0.072f - cs * 0.072f + sn * 0.928f,
            0.213f - cs * 0.213f + sn * 0.143f, 0.715f + cs * 0.285f + sn * 0.140f, 0.072f - cs * 0.072f - sn * 0.283f,
            0.213f - cs * 0.213f - sn * 0.787f, 0.715f - cs * 0.715f + sn * 0.715f, 0.072f + cs * 0.928f + sn * 0.072f,
        )
        val sm = floatArrayOf(
            0.213f + 0.787f * sat, 0.715f - 0.715f * sat, 0.072f - 0.072f * sat,
            0.213f - 0.213f * sat, 0.715f + 0.285f * sat, 0.072f - 0.072f * sat,
            0.213f - 0.213f * sat, 0.715f - 0.715f * sat, 0.072f + 0.928f * sat,
        )
        // m = brightness · saturate · hue (행 우선 3×3)
        val m = FloatArray(9)
        for (r in 0 until 3) for (col in 0 until 3) {
            var v = 0f
            for (j in 0 until 3) v += sm[r * 3 + j] * hm[j * 3 + col]
            m[r * 3 + col] = v * bright
        }
        return ColorMatrix(floatArrayOf(
            m[0], m[1], m[2], 0f, 0f,
            m[3], m[4], m[5], 0f, 0f,
            m[6], m[7], m[8], 0f, 0f,
            0f, 0f, 0f, 1f, 0f,
        ))
    }

    /**
     * 단풍잎 화환 — 고리를 따라 작은 벡터 잎이 엇갈려 엮이고, 지난 기념일에서 지금까지 온 만큼(맨 위에서 시계 방향) 물든다:
     * 호박빛에서 단풍 붉음으로 짙어지고, 아직 오지 않은 자리는 옅은 윤곽. 지금 자리의 잎은 조금 크게. 오늘이면 다 물든다.
     */
    override fun countdownRing(c: Canvas, cx: Float, cy: Float, r: Float, frac: Float, pal: Palette) {
        val n = (2.0 * PI * r / dp(8.6f)).toInt().coerceIn(14, 28)
        val size = (2.0 * PI * r / n).toFloat() * 1.12f
        val f = frac.coerceIn(0f, 1f)
        val lit = (f * n).toInt().coerceAtMost(n)
        val faint = Palette.withAlpha(pal.ink, if (pal.dark) 0.24f else 0.18f)
        for (i in 0 until n) {
            val t = (i + 0.5f) / n
            val a = -PI / 2 + 2 * PI * t
            val x = cx + cos(a).toFloat() * r
            val y = cy + kotlin.math.sin(a).toFloat() * r
            val on = i < lit || f >= 1f
            val now = i == lit && f < 1f
            // 잎은 고리의 접선을 따라 누우며 안팎으로 엇갈린다 — 엮은 화환처럼
            val turn = Math.toDegrees(a).toFloat() + 90f + (if (i % 2 == 0) -32f else 32f)
            val color = if (on) mix(amber(pal), pal.gold, (i / (n - 1f)).coerceIn(0f, 1f)) else faint
            leaf(c, x, y, if (now) size * 1.25f else size, turn, if (now) pal.gold else color, filled = on || now, strokePx = dp(0.8f))
        }
    }

    /** 두 빛깔 사이 (0 이면 a, 1 이면 b) */
    private fun mix(a: Int, b: Int, t: Float): Int = Color.argb(
        (Color.alpha(a) + (Color.alpha(b) - Color.alpha(a)) * t).toInt(),
        (Color.red(a) + (Color.red(b) - Color.red(a)) * t).toInt(),
        (Color.green(a) + (Color.green(b) - Color.green(a)) * t).toInt(),
        (Color.blue(a) + (Color.blue(b) - Color.blue(a)) * t).toInt(),
    )

    /** 벡터 단풍잎 하나 — 가운데(cx, cy)·크기(상자 한 변)·돌림. 윤곽 잎의 선 굵기는 strokePx(화면 px) */
    private fun leaf(c: Canvas, cx: Float, cy: Float, size: Float, turn: Float, color: Int, filled: Boolean, strokePx: Float = 0f) {
        val k = size / 24f
        c.save()
        c.translate(cx, cy)
        c.rotate(turn)
        c.scale(k, k)
        c.translate(-12f, -12f)
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            this.color = color
            strokeJoin = Paint.Join.ROUND
            if (filled) { style = Paint.Style.FILL_AND_STROKE; strokeWidth = 0.7f }
            else { style = Paint.Style.STROKE; strokeWidth = max(1.6f, strokePx / k) }
        }
        c.drawPath(LEAF, p)
        c.restore()
    }

    override fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float) {
        leaf(c, cx, cy, dp(rDp) * 2.7f, 0f, color, filled, dp(strokeDp))
    }

    override fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float {
        val s = dp(sizeDp)
        leaf(c, x + s / 2f, cy, s, -12f, color, filled = true)
        return s
    }

    override fun todayMark(c: Canvas, cx: Float, cy: Float, rDp: Float, pal: Palette) {
        // 단풍 붉음을 옅게 깐 동그라미에 붉은 테 — 숫자는 화가가 붉은 글씨로 얹는다
        val r = dp(rDp)
        c.drawCircle(cx, cy, r, fill(Palette.withAlpha(pal.gold, if (pal.dark) 0.22f else 0.13f)))
        c.drawCircle(cx, cy, r, stroke(pal.gold, 1.3f))
    }

    override fun dayArrow(c: Canvas, cx: Float, cy: Float, sizeDp: Float, color: Int, right: Boolean) {
        // 꺾쇠 하나 — 앱의 Maple 화살(lucide 꺾쇠)과 같은 말
        val s = dp(sizeDp)
        val dir = if (right) -1f else 1f
        val p = stroke(color, 1.6f).apply { strokeCap = Paint.Cap.ROUND; strokeJoin = Paint.Join.ROUND }
        c.drawPath(Path().apply {
            moveTo(cx + dir * s * 0.45f, cy - s * 0.5f)
            lineTo(cx - dir * s * 0.1f, cy)
            lineTo(cx + dir * s * 0.45f, cy + s * 0.5f)
        }, p)
    }

    override fun gaugeBase(c: Canvas, cx: Float, cy: Float, r: Float, pal: Palette): Int {
        // 둥근 홈 한 줄 — 눈금·바늘은 화가가 얹는다(글자색 눈금)
        val track = stroke(Palette.withAlpha(pal.ink, if (pal.dark) 0.14f else 0.08f), 5f).apply { strokeCap = Paint.Cap.ROUND }
        val k = dp(2.5f)
        c.drawArc(RectF(cx - r + k, cy - r + k, cx + r - k, cy + r - k), 180f, 180f, false, track)
        return pal.ink
    }

    companion object {
        /** 웹의 LEAF_PATH(styles/maple/ink.ts, 24 단위)를 그대로 옮긴 단풍잎 — 다섯 갈래, 곧은 마디 */
        private val LEAF: Path = Path().apply {
            val pts = floatArrayOf(
                12f, 1.6f, 13.7f, 5.3f, 16.3f, 4.1f, 15.7f, 8.7f, 19.5f, 7.1f, 18.7f, 9.5f, 22.4f, 10.7f, 19.6f, 12.7f,
                20.5f, 14.5f, 15.4f, 14.1f, 15.8f, 16.1f, 12.7f, 15f, 12.6f, 22.4f, 11.4f, 22.4f, 11.3f, 15f, 8.2f, 16.1f,
                8.6f, 14.1f, 3.5f, 14.5f, 4.4f, 12.7f, 1.6f, 10.7f, 5.3f, 9.5f, 4.5f, 7.1f, 8.3f, 8.7f, 7.7f, 4.1f, 10.3f, 5.3f,
            )
            moveTo(pts[0], pts[1])
            var i = 2
            while (i < pts.size) { lineTo(pts[i], pts[i + 1]); i += 2 }
            close()
        }
    }
}
