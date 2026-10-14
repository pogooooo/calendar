package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.sin

/**
 * Ocean — 얕은 물 속을 유리 너머로 보는 듯. 데스크톱 위젯(OceanWidgetDecor)과 같은 말: 물빛(위는 청록, 아래로 얕아져 모래빛),
 * 물바닥에 어른거리는 빛 그물, 위에서 비스듬히 내려오는 햇살. 홈 위젯은 멈춘 그림이다 — 끝없이 도는 그림은 배터리를 먹는다.
 * 빛 그물은 앱의 물 셰이더(OceanCaustics)와 같은 식으로 한 장을 그린다(데스크톱의 caustic.ts 와 같다).
 * 표식은 Celestial 과 같은 한 빛깔 동그라미(찬 점·빈 고리) — 물방울 표식은 걷었다(사용자: "모바일 홈 화면의 물방울 지워줘").
 */
class OceanStyle(context: Context, density: Float) : CelestialStyle(context, density) {
    override val display: Typeface = Typeface.create("sans-serif", Typeface.NORMAL)
    override val numeral: Typeface = display
    override val titleSpacing = 0.05f

    override fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int) {
        val rect = plate(w, h)
        val r = dp(WidgetPainter.RADIUS.toFloat())
        val a = alphaPct / 100f
        c.drawRoundRect(rect, r, r, fill(Palette.withAlpha(pal.bg, a)))
        c.save()
        c.clipPath(rounded(rect, r))
        // 물빛 — 위는 청록, 아래로 갈수록 얕아져 모래빛. 앱의 물(deep·mid·shallow·sand)을 유리 너머로 보듯 옅게
        val tint = if (pal.dark) intArrayOf(argb(0.85f * a, 10, 48, 54), argb(0.55f * a, 10, 48, 54), argb(0.5f * a, 15, 38, 40))
        else intArrayOf(argb(0.42f * a, 38, 153, 161), argb(0.3f * a, 117, 204, 199), argb(0.55f * a, 240, 232, 214))
        c.drawRect(rect, Paint().apply { shader = LinearGradient(0f, 0f, 0f, h, tint, floatArrayOf(0f, 0.55f, 1f), Shader.TileMode.CLAMP) })
        drawCaustics(c, rect, pal, a)
        rays(c, w, h, pal, a)
        c.restore()
        c.drawRoundRect(rect, r, r, stroke(Palette.withAlpha(pal.gold, 0.3f), 1f))
    }

    /**
     * 빛 그물 — 1dp 에 한 점씩 셈하고 부드럽게 늘려 깐다(무른 무늬라 티가 안 난다). 무늬 한 주기는 190dp(데스크톱의 CELL 과 같다).
     * 위젯 종류마다 다른 한 장(같은 종류는 늘 같은 무늬). 아래(모래 위)로 갈수록 옅게.
     */
    private fun drawCaustics(c: Canvas, rect: RectF, pal: Palette, a: Float) {
        val w = max(1, (rect.width() / density).toInt())
        val h = max(1, (rect.height() / density).toInt())
        val cell = 190f
        val t = 4f + ((kind.hashCode() and 0xFFFF) / 65535f) * 30f
        val ts = t * 0.3f + 23f
        val t2 = t * 0.22f + 11f
        val rgb = if (pal.dark) 0x80F2DE else 0xFFFFF8
        val px = IntArray(w * h)
        for (y in 0 until h) {
            val v = (h - y) / cell
            for (x in 0 until w) {
                val u = x / cell
                val cg = caustic(u, v, ts)
                val c2 = caustic(u * 1.3f + 0.31f, v * 1.3f + 0.17f, t2)
                val swell = 0.62f + 0.38f * sin(u * 1.1f + t * 0.05f) * sin(v * 0.9f - t * 0.04f)
                val al = min(1f, (cg * 0.85f + c2 * 0.4f) * swell * 2f)
                px[y * w + x] = ((al * 255).toInt() shl 24) or rgb
            }
        }
        val bmp = Bitmap.createBitmap(px, w, h, Bitmap.Config.ARGB_8888)
        c.saveLayer(rect, null)
        c.drawBitmap(bmp, null, rect, Paint(Paint.FILTER_BITMAP_FLAG).apply { alpha = ((if (pal.dark) 0.32f else 0.75f) * a * 255).toInt() })
        // 아래로 갈수록 옅게 (데스크톱의 mask: #000 35% → 50%)
        c.drawRect(rect, Paint().apply {
            shader = LinearGradient(0f, rect.top + rect.height() * 0.35f, 0f, rect.bottom,
                Color.BLACK, Palette.withAlpha(Color.BLACK, 0.5f), Shader.TileMode.CLAMP)
            xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
        })
        c.restore()
        bmp.recycle()
    }

    /** 앱의 물 셰이더 caustic(uv, t) 와 한 줄씩 같다 — 겹쳐 비틀린 사인 물결의 초점 */
    private fun caustic(u: Float, v: Float, t: Float): Float {
        val px = u * 6.28318f - 250f
        val py = v * 6.28318f - 250f
        var ix = px
        var iy = py
        var c = 1f
        val inten = 0.005f
        for (n in 0 until 5) {
            val tt = t * (1f - 3.5f / (n + 1))
            val nx = px + (cos(tt - ix) + sin(tt + iy))
            val ny = py + (sin(tt - iy) + cos(tt + ix))
            ix = nx
            iy = ny
            c += 1f / hypot(px / (sin(ix + tt) / inten), py / (cos(iy + tt) / inten))
        }
        c /= 5f
        c = 1.17f - c.pow(1.4f)
        return abs(c).pow(8f)
    }

    /** 햇살 — 위에서 비스듬히(104°) 내려오는 옅은 띠, 아래로 옅어진다. 데스크톱의 repeating-linear-gradient 와 같은 간격(90dp 마다) */
    private fun rays(c: Canvas, w: Float, h: Float, pal: Palette, a: Float) {
        val rect = RectF(0f, 0f, w, h)
        val period = dp(90f)
        // CSS 104° 의 방향(오른쪽으로, 조금 아래로)
        val dx = 0.9703f * period
        val dy = 0.2419f * period
        val ray = argb((if (pal.dark) 0.04f else 0.14f) * a, 255, 255, 255)
        val clear = Color.TRANSPARENT
        c.saveLayer(rect, null)
        c.drawRect(rect, Paint().apply {
            shader = LinearGradient(0f, 0f, dx, dy, intArrayOf(clear, clear, ray, clear, clear),
                floatArrayOf(0f, 34f / 90f, 40f / 90f, 52f / 90f, 1f), Shader.TileMode.REPEAT)
        })
        c.drawRect(rect, Paint().apply {
            shader = LinearGradient(0f, 0f, 0f, h * 0.72f, Color.BLACK, Color.TRANSPARENT, Shader.TileMode.CLAMP)
            xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
        })
        c.restore()
    }

    private fun argb(a: Float, r: Int, g: Int, b: Int) = Color.argb((a.coerceIn(0f, 1f) * 255).toInt(), r, g, b)

    override fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float {
        // 잔물결 두 줄 — 물 위의 결
        val s = dp(sizeDp)
        val p = stroke(color, 1f).apply { strokeCap = Paint.Cap.ROUND }
        for (k in 0..1) {
            val y = cy - s * 0.2f + k * s * 0.4f
            c.drawPath(Path().apply {
                moveTo(x, y)
                quadTo(x + s * 0.25f, y - s * 0.2f, x + s * 0.5f, y)
                quadTo(x + s * 0.75f, y + s * 0.2f, x + s, y)
            }, p)
        }
        return s
    }

    override fun todayMark(c: Canvas, cx: Float, cy: Float, rDp: Float, pal: Palette) {
        // 옅게 고인 물빛 동그라미와 테 — 숫자(물빛 글씨)가 그 위에서 읽히게 안은 아주 옅게
        val r = dp(rDp)
        c.drawCircle(cx, cy, r, fill(Palette.withAlpha(pal.gold, if (pal.dark) 0.16f else 0.12f)))
        c.drawCircle(cx, cy, r, stroke(Palette.withAlpha(pal.gold, 0.75f), 1f))
    }
}
