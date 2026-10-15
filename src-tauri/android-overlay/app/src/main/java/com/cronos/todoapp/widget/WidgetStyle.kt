package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RadialGradient
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import kotlin.math.PI
import kotlin.math.abs
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
 * Maple — 가을 노트. 데스크톱 위젯(MapleWidgetDecor)과 같은 말: 카드색 판에 옅은 선 테두리, 위에서 비치는 따뜻한 빛
 * (오른쪽 위 호박빛·왼쪽 아래 단풍빛), 가장자리를 따라 진 단풍잎 몇 장(또렷한 벡터 잎 — 단풍 붉음·호박빛·갈잎빛을 옅게),
 * 오른쪽 아래 구석에 크게 걸친 선 잎 한 장(가는 선과 잎맥). 표식도 같은 벡터 잎이다.
 * 2026-10-15 다시 그리며 종이결 타일·먹 카드 테·수채 가지·먹 화살·놋쇠 계기판 그림(res 의 maple_* 그림)을 걷었다 — 그림 파일을 쓰지 않는다.
 */
class MapleStyle(context: Context, density: Float) : WidgetStyle(context, density) {
    /** 제목은 고운바탕을 굵게(굵은 글꼴 파일은 싣지 않는다 — 안드로이드가 굵기를 지어 낸다), 숫자는 산세리프 굵게 */
    override val display: Typeface = Typeface.create(Fonts.gowun(context), Typeface.BOLD)
    override val numeral: Typeface = Typeface.create("sans-serif", Typeface.BOLD)
    override val titleSpacing = 0.01f

    /** 호박빛 — 앱의 accent. 팔레트에는 강조색(단풍 붉음) 하나뿐이라 여기 둔다 */
    private fun amber(pal: Palette): Int = if (pal.dark) 0xFFE8B567.toInt() else 0xFFE2A54D.toInt()

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
        fallenLeaves(c, w, h, pal, a)
        cornerLeaf(c, w, h, pal, a)
        c.restore()
        c.drawRoundRect(rect, r, r, stroke(pal.line, 1f))
    }

    private fun glow(c: Canvas, x: Float, y: Float, radius: Float, color: Int) {
        c.drawCircle(x, y, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(x, y, radius, color, Palette.withAlpha(color, 0f), Shader.TileMode.CLAMP)
        })
    }

    /**
     * 진 잎 — 가장자리를 따라(글이 가장 적은 곳). 위젯 종류마다 다른 자리·각도(같은 종류는 늘 같은 무늬).
     * 칸이 판을 채우는 위젯(busy)에서는 몇 장만, 더 옅게. 자리는 데스크톱의 SLOTS 와 같다.
     */
    private fun fallenLeaves(c: Canvas, w: Float, h: Float, pal: Palette, a: Float) {
        var seed = kind.hashCode() xor 0x2c1b3c6d
        fun rnd(): Float { seed = seed * 1103515245 + 12345; return ((seed ushr 8) and 0xFFFF) / 65535f }
        val base = (min(w, h) / density * 0.065f).coerceIn(13f, 26f)
        val tones = intArrayOf(
            Palette.withAlpha(pal.gold, if (pal.dark) 0.34f else 0.26f),
            Palette.withAlpha(amber(pal), if (pal.dark) 0.32f else 0.36f),
            Palette.withAlpha(pal.ink, if (pal.dark) 0.16f else 0.13f),
        )
        val start = (rnd() * 3).toInt()
        val fade = if (busy) 0.55f else 1f
        for ((i, slot) in SLOTS.withIndex()) {
            val left = slot[0] + rnd() * (slot[1] - slot[0])
            val top = slot[2] + rnd() * (slot[3] - slot[2])
            val size = dp(base * slot[4] * (0.8f + rnd() * 0.4f))
            val turn = rnd() * 360f
            if (busy && i !in BUSY_SLOTS) continue
            val color = tones[(start + i) % tones.size]
            val cx = w * left / 100f + size / 2f
            val cy = h * top / 100f + size / 2f
            leaf(c, cx, cy, size, turn, Palette.withAlpha(color, Color.alpha(color) / 255f * fade * a), filled = true)
        }
    }

    /** 오른쪽 아래 구석에 크게 걸친 선 잎 — 판의 반쯤만 보인다(데스크톱의 .corner). 칸이 가득한 위젯에서는 작게 */
    private fun cornerLeaf(c: Canvas, w: Float, h: Float, pal: Palette, a: Float) {
        val m = min(w, h)
        val size = m * (if (busy) 0.36f else 0.64f)
        val right = w + m * (if (busy) 0.08f else 0.12f)
        val bottom = h + m * (if (busy) 0.09f else 0.14f)
        val left = right - size
        val top = bottom - size
        val k = size / 24f
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 0.28f
            strokeJoin = Paint.Join.ROUND
            strokeCap = Paint.Cap.ROUND
            color = Palette.withAlpha(pal.gold, (if (pal.dark) 0.3f else 0.22f) * (if (busy) 0.7f else 1f) * a)
        }
        c.save()
        c.rotate(-24f, left + size * 0.7f, top + size * 0.8f)
        c.translate(left, top)
        c.scale(k, k)
        c.drawPath(LEAF, p)
        c.drawPath(VEINS, p)
        c.restore()
    }

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

        /** 선 잎의 잎맥 (데스크톱의 LEAF_LINE 과 같다) */
        private val VEINS: Path = Path().apply {
            moveTo(12f, 15f); lineTo(12f, 3.2f)
            moveTo(12f, 15f); lineTo(20.4f, 10.7f)
            moveTo(12f, 15f); lineTo(3.6f, 10.7f)
            moveTo(12f, 15f); lineTo(18.6f, 13.9f)
            moveTo(12f, 15f); lineTo(5.4f, 13.9f)
            moveTo(12f, 9.6f); lineTo(14.6f, 7.4f)
            moveTo(12f, 9.6f); lineTo(9.4f, 7.4f)
        }

        /** 잎 자리 — [왼쪽 % 처음, 끝, 위쪽 % 처음, 끝, 크기 배] (데스크톱의 SLOTS) */
        private val SLOTS = arrayOf(
            floatArrayOf(6f, 16f, 8f, 15f, 1f),
            floatArrayOf(52f, 68f, 5f, 10f, 0.8f),
            floatArrayOf(90f, 95f, 26f, 40f, 0.9f),
            floatArrayOf(4f, 14f, 84f, 92f, 1.1f),
            floatArrayOf(32f, 46f, 88f, 94f, 0.85f),
            floatArrayOf(0f, 3f, 48f, 60f, 0.7f),
        )
        private val BUSY_SLOTS = setOf(0, 2, 4)
    }
}
