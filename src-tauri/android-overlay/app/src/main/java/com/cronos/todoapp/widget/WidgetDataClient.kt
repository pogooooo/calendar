package com.cronos.todoapp.widget

import android.content.Context
import com.cronos.todoapp.BuildConfig
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.TimeZone
import java.util.UUID

/** Widget-only credentials; the app's rotating access/refresh tokens are never copied here. */
class WidgetDataClient(private val context: Context) {
    private val dir = File(context.applicationInfo.dataDir)
    val root: JSONObject = try { JSONObject(File(dir, CronosWidgetProvider.SNAPSHOT_FILE).readText()) } catch (_: Exception) { JSONObject() }
    private val quick = root.optJSONObject("quickAdd") ?: JSONObject()
    private val api = quick.optString("api").trimEnd('/')
    private val token = quick.optString("token")
    val timeZone: TimeZone = TimeZone.getTimeZone(root.optString("timeZone", TimeZone.getDefault().id))
    val ready: Boolean get() = token.isNotBlank() && (api.startsWith("https://") || (BuildConfig.DEBUG && api.startsWith("http://")))
    fun query(value: String): String = URLEncoder.encode(value, "UTF-8")

    fun request(method: String, path: String, payload: JSONObject? = null): JSONObject {
        check(ready) { "앱에서 로그인한 뒤 다시 시도해 주세요." }
        val currentToken = try { JSONObject(File(dir, CronosWidgetProvider.SNAPSHOT_FILE).readText()).optJSONObject("quickAdd")?.optString("token") } catch (_: Exception) { null }
        if (currentToken != token) throw WidgetRequestError(409, "로그인 상태가 바뀌었습니다. 위젯을 닫고 다시 열어 주세요.")
        val connection = URL(api + path).openConnection() as HttpURLConnection
        try {
            connection.requestMethod = method
            connection.connectTimeout = 10_000; connection.readTimeout = 15_000
            connection.instanceFollowRedirects = false
            connection.setRequestProperty("Authorization", "Bearer $token")
            connection.setRequestProperty("Content-Type", "application/json; charset=utf-8")
            if (payload != null) {
                connection.doOutput = true
                connection.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }
            }
            val code = connection.responseCode
            val text = (if (code in 200..299) connection.inputStream else connection.errorStream)?.bufferedReader()?.use { it.readText() }.orEmpty()
            val json = try { JSONObject(text) } catch (_: Exception) { JSONObject() }
            if (code !in 200..299) throw WidgetRequestError(code, json.optString("message").ifBlank { "연결을 확인하고 다시 시도해 주세요." })
            return json
        } finally { connection.disconnect() }
    }

    fun day(date: String): JSONObject {
        val data = request("GET", "/api/widget/todo?date=${query(date)}&timeZone=${query(timeZone.id)}")
        cache(data)
        return data
    }

    /** Call after the write commits, even when the following refresh fails. Never retry a POST implicitly. */
    fun changed() {
        val tmp = File(dir, "pending-link.${UUID.randomUUID()}.tmp")
        tmp.writeText("cronos://refresh/todos")
        if (!tmp.renameTo(File(dir, "pending-link.txt"))) tmp.delete()
    }

    private fun cache(data: JSONObject) = synchronized(lock) {
        val file = File(dir, CronosWidgetProvider.SNAPSHOT_FILE)
        val latest = try { JSONObject(file.readText()) } catch (_: Exception) { return@synchronized }
        // A late response from the previous account must never resurrect its data after logout/login.
        if (latest.optJSONObject("quickAdd")?.optString("token") != token) return@synchronized
        val entries = LinkedHashMap<String, JSONObject>()
        for (list in listOf(data.optJSONArray("snapshotTodos"), data.optJSONArray("items"))) {
            if (list == null) continue
            for (i in 0 until list.length()) list.optJSONObject(i)?.let { entries[it.optString("id") + "@" + it.optString("startAt")] = it }
        }
        latest.put("todos", JSONArray(entries.values.sortedBy { it.optString("startAt") }))
        latest.optJSONObject("quickAdd")?.put("categories", data.optJSONArray("categories") ?: JSONArray())
        val tmp = File(dir, "${CronosWidgetProvider.SNAPSHOT_FILE}.${UUID.randomUUID()}.tmp")
        tmp.writeText(latest.toString())
        if (!tmp.renameTo(file)) tmp.delete()
        WidgetRefresh.broadcast(context)
    }

    companion object { private val lock = Any() }
}

class WidgetRequestError(val status: Int, message: String) : Exception(message)
