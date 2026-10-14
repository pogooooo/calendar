package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapShader
import android.graphics.BlurMaskFilter
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface

/**
 * Ocean — 얕은 물 속. 데스크톱 위젯(OceanWidgetDecor)과 같은 말: 물빛(위는 청록, 아래로 얕아져 모래빛),
 * 물바닥에 어른거리는 빛 그물(커스틱), 위에서 비스듬히 내려오는 햇살. 홈 위젯은 멈춘 그림이다 — 끝없이 도는 그림은 배터리를 먹는다.
 * 빛 그물은 scripts/ocean-widget-assets.mjs 가 데스크톱과 같은 난류(feTurbulence)로 구운 타일(ocean_caustics)을 깐다.
 * 표식은 물방울, 오늘 칸은 옅게 고인 물빛 동그라미.
 */
class OceanStyle(context: Context, density: Float) : CelestialStyle(context, density) {
    override val display: Typeface = Typeface.create("sans-serif", Typeface.NORMAL)
    override val numeral: Typeface = display
    override val titleSpacing = 0.05f

    private val caustics by lazy { bmp("ocean_caustics") }

    override fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int) {
        val rect = plate(w, h)
        val r = dp(WidgetPainter.RADIUS.toFloat())
        val a = alphaPct / 100f
        c.drawRoundRect(rect, r, r, fill(Palette.withAlpha(pal.bg, a)))
        c.save()
        c.clipPath(rounded(rect, r))
        // 물빛 — 위는 청록, 아래로 갈수록 얕아져 모래빛(밝은 벌). 어두운 벌은 위에 청록이 옅게 고일 뿐
        val tint = if (pal.dark) intArrayOf(argb(0.16f * a, 40, 150, 150), argb(0.04f * a, 40, 150, 150), argb(0.05f * a, 160, 240, 230))
        else intArrayOf(argb(0.3f * a, 59, 166, 168), argb(0.16f * a, 122, 207, 201), argb(0.42f * a, 239, 232, 214))
        c.drawRect(rect, Paint().apply { shader = LinearGradient(0f, 0f, 0f, h, tint, floatArrayOf(0f, 0.55f, 1f), Shader.TileMode.CLAMP) })
        caustics?.let { drawCaustics(c, it, rect, pal, a) }
        rays(c, w, h, pal, a)
        c.restore()
        c.drawRoundRect(rect, r, r, stroke(Palette.withAlpha(pal.gold, 0.3f), 1f))
    }

    /**
     * 빛 그물 — 흰 그물을 깔고, 밝은 벌에서는 그 아래에 청록 그늘을 조금 비켜 깐다(흰 그물이 밝은 바탕에 묻히지 않게, 물속의 깊이).
     * 타일은 2배 밀도로 구운 것이라 density/2 로 줄여 깐다. 아래로 갈수록 조금 옅게.
     */
    private fun drawCaustics(c: Canvas, tile: Bitmap, rect: RectF, pal: Palette, a: Float) {
        val scale = Matrix().apply { setScale(density / 2f, density / 2f) }
        c.saveLayer(rect, null)
        if (!pal.dark) {
            // 그늘: 그물의 알파만 흐리게 떠서 청록으로 (알파 그림을 셰이더로 깔면 붓의 색이 입혀진다)
            val off = IntArray(2)
            val blurred = tile.extractAlpha(Paint().apply { maskFilter = BlurMaskFilter(2f, BlurMaskFilter.Blur.NORMAL) }, off)
            // 흐리게 뜨면 가장자리만큼 커진다 — 타일 크기로 다시 잘라야 이어 붙는 주기가 맞는다
            val shade = Bitmap.createBitmap(tile.width, tile.height, Bitmap.Config.ALPHA_8)
            Canvas(shade).drawBitmap(blurred, off[0].toFloat(), off[1].toFloat(), null)
            val m = Matrix(scale).apply { postTranslate(dp(1f), dp(1.6f)) }
            c.drawRect(rect, Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = Palette.withAlpha(0xFF1F8A8F.toInt(), 0.35f * 0.62f * a)
                shader = BitmapShader(shade, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT).apply { setLocalMatrix(m) }
            })
        }
        c.drawRect(rect, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = BitmapShader(tile, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT).apply { setLocalMatrix(scale) }
            alpha = ((if (pal.dark) 0.22f else 0.62f) * a * 255).toInt()
        })
        // 아래로 갈수록 옅게 (데스크톱의 mask: #000 30% → 55%)
        c.drawRect(rect, Paint().apply {
            shader = LinearGradient(0f, rect.top + rect.height() * 0.3f, 0f, rect.bottom,
                Color.BLACK, Palette.withAlpha(Color.BLACK, 0.55f), Shader.TileMode.CLAMP)
            xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
        })
        c.restore()
    }

    /** 햇살 — 위에서 비스듬히(104°) 내려오는 옅은 띠, 아래로 옅어진다. 데스크톱의 repeating-linear-gradient 와 같은 간격(90dp 마다) */
    private fun rays(c: Canvas, w: Float, h: Float, pal: Palette, a: Float) {
        val rect = RectF(0f, 0f, w, h)
        val period = dp(90f)
        // CSS 104° 의 방향(오른쪽으로, 조금 아래로)
        val dx = 0.9703f * period
        val dy = 0.2419f * period
        val ray = argb((if (pal.dark) 0.05f else 0.16f) * a, 255, 255, 255)
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

    override fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float) {
        // 물방울 — 위가 뾰족하고 아래가 둥글다 (예전 꼴은 거꾸로라 작게 그리면 ▽ 로 읽혔다)
        val r = dp(rDp)
        val y = cy + r * 0.1f // 둥근 쪽이 무거워 보여 조금 내린다
        val p = Path().apply {
            moveTo(cx, y - r * 1.25f)
            cubicTo(cx + r * 0.3f, y - r * 0.7f, cx + r, y - r * 0.25f, cx + r, y + r * 0.25f)
            arcTo(RectF(cx - r, y - r * 0.75f, cx + r, y + r * 1.25f), 0f, 180f)
            cubicTo(cx - r, y - r * 0.25f, cx - r * 0.3f, y - r * 0.7f, cx, y - r * 1.25f)
            close()
        }
        c.drawPath(p, if (filled) fill(color) else stroke(color, strokeDp))
    }

    override fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float {
        // 잔물결 두 줄 — 물 위의 결 (방울 셋은 작게 그리면 ♂ 처럼 읽혔다)
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
        // 위 왼쪽에 맺힌 빛 — 유리 방울처럼
        c.drawCircle(cx - r * 0.45f, cy - r * 0.5f, dp(1.2f), fill(Palette.withAlpha(Color.WHITE, if (pal.dark) 0.5f else 0.9f)))
    }
}
