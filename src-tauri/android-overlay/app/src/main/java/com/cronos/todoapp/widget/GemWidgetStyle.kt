package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.BitmapShader
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorFilter
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PixelFormat
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.graphics.drawable.Drawable
import kotlin.math.max
import kotlin.math.min

/** Generated neutral mineral textures, recolored without changing their grain. Simple style stays quiet. */
class GemWidgetStyle(context: Context, density: Float) : WidgetStyle(context, density) {
    override val display: Typeface = Fonts.gowun(context)
    override val numeral: Typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
    override val titleSpacing = 0.035f

    private val quartz by lazy { bmp("gem_widget_quartz") }

    override fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int) {
        val rect = plate(w, h)
        val radius = dp(16f)
        val opacity = alphaPct / 100f
        val material = quartz
        val face = if (material == null) fill(Palette.withAlpha(pal.bg, opacity)) else {
            val shadow = blend(pal.bg, Color.BLACK, if (busy) .035f else .085f)
            val light = blend(pal.bg, Color.WHITE, if (pal.dark) .065f else .16f)
            texture(material, rect, opacity).apply { colorFilter = tone(shadow, light) }
        }
        // A single image pass preserves the user's widget background opacity.
        c.drawRoundRect(rect, radius, radius, face)
        c.drawRoundRect(rect, radius, radius, stroke(pal.line, 1f))
        val gap = dp(3f)
        if (w > dp(28f) && h > dp(28f)) {
            val inner = RectF(rect).apply { inset(gap, gap) }
            c.drawRoundRect(inner, radius - gap, radius - gap, stroke(Palette.withAlpha(pal.gold, .22f), .7f))
        }
    }

    override fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float) {
        val r = dp(rDp)
        c.drawCircle(cx, cy, r, if (filled) fill(color) else stroke(color, strokeDp))
    }

    override fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float {
        val w = dp(sizeDp)
        val facet = Path().apply {
            moveTo(x + w * .5f, cy - w * .55f)
            lineTo(x + w, cy - w * .13f)
            lineTo(x + w * .5f, cy + w * .55f)
            lineTo(x, cy - w * .13f)
            close()
        }
        c.drawPath(facet, stroke(color, 1f))
        c.drawLine(x + w * .5f, cy - w * .55f, x + w * .5f, cy + w * .55f, stroke(color, .7f))
        return w
    }

    override fun todayMark(c: Canvas, cx: Float, cy: Float, rDp: Float, pal: Palette) {
        val r = dp(rDp)
        val rect = RectF(cx - r * .42f, cy - r * .91f, cx + r * .42f, cy - r * .75f)
        c.drawRoundRect(rect, dp(1f), dp(1f), fill(pal.gold))
    }

    override fun gaugeBase(c: Canvas, cx: Float, cy: Float, r: Float, pal: Palette): Int {
        c.drawArc(RectF(cx-r, cy-r, cx+r, cy+r), 180f, 180f, false, stroke(pal.line, 1.1f))
        return pal.goldText
    }

    override fun dayArrow(c: Canvas, cx: Float, cy: Float, sizeDp: Float, color: Int, right: Boolean) {
        val s = dp(sizeDp)
        val dir = if (right) -1f else 1f
        val path = Path().apply {
            moveTo(cx + s * .55f * dir, cy - s * .55f)
            lineTo(cx, cy)
            lineTo(cx + s * .55f * dir, cy + s * .55f)
        }
        c.drawPath(path, stroke(color, 1.4f).apply { strokeJoin = Paint.Join.ROUND; strokeCap = Paint.Cap.ROUND })
    }

    companion object {
        const val ACTION_INK = 0xFFFFF7FC.toInt()

        private fun blend(from: Int, to: Int, weight: Float): Int = Color.rgb(
            (Color.red(from) + (Color.red(to) - Color.red(from)) * weight).toInt(),
            (Color.green(from) + (Color.green(to) - Color.green(from)) * weight).toInt(),
            (Color.blue(from) + (Color.blue(to) - Color.blue(from)) * weight).toInt(),
        )

        private fun tone(low: Int, high: Int): ColorMatrixColorFilter = ColorMatrixColorFilter(ColorMatrix(floatArrayOf(
            (Color.red(high) - Color.red(low)) / 255f, 0f, 0f, 0f, Color.red(low).toFloat(),
            (Color.green(high) - Color.green(low)) / 255f, 0f, 0f, 0f, Color.green(low).toFloat(),
            (Color.blue(high) - Color.blue(low)) / 255f, 0f, 0f, 0f, Color.blue(low).toFloat(),
            0f, 0f, 0f, 1f, 0f,
        )))

        private fun texture(bitmap: Bitmap, rect: RectF, opacity: Float): Paint {
            val factor = max(rect.width() / bitmap.width, rect.height() / bitmap.height)
            val matrix = Matrix().apply {
                setScale(factor, factor)
                postTranslate(rect.centerX() - bitmap.width * factor / 2, rect.centerY() - bitmap.height * factor / 2)
            }
            return Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply {
                alpha = (opacity * 255).toInt()
                shader = BitmapShader(bitmap, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP).apply { setLocalMatrix(matrix) }
            }
        }

        fun actionSurface(context: Context, palette: Palette): Drawable {
            val bitmap = BitmapFactory.decodeResource(context.resources, com.cronos.todoapp.R.drawable.gem_widget_lustre)
            val rect = RectF()
            val hsv = FloatArray(3)
            Color.colorToHSV(palette.gemStone, hsv)
            hsv[1] = min(hsv[1], .58f)
            hsv[2] = .34f
            val core = Color.HSVToColor(hsv)
            val dye = tone(blend(core, Color.BLACK, .72f), blend(core, Color.WHITE, .24f))
            val fallback = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = core }
            val rim = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = 0xFFAD8A65.toInt()
                style = Paint.Style.STROKE
                strokeWidth = context.resources.displayMetrics.density
            }
            return object : Drawable() {
                private var face = fallback
                private var overrideFilter: ColorFilter? = null

                override fun onBoundsChange(bounds: Rect) {
                    rect.set(bounds)
                    rect.inset(rim.strokeWidth / 2, rim.strokeWidth / 2)
                    face = if (bitmap == null) fallback else texture(bitmap, rect, face.alpha / 255f).apply { colorFilter = overrideFilter ?: dye }
                }

                override fun draw(canvas: Canvas) {
                    val radius = rect.height() / 2
                    canvas.drawRoundRect(rect, radius, radius, face)
                    canvas.drawRoundRect(rect, radius, radius, rim)
                }

                override fun setAlpha(alpha: Int) { face.alpha = alpha; rim.alpha = alpha }
                override fun setColorFilter(colorFilter: ColorFilter?) {
                    overrideFilter = colorFilter
                    face.colorFilter = colorFilter ?: if (bitmap != null) dye else null
                    rim.colorFilter = colorFilter
                }
                @Deprecated("Android Drawable contract")
                override fun getOpacity(): Int = PixelFormat.TRANSLUCENT
            }
        }
    }
}
