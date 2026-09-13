package com.cronos.todoapp

import android.os.Bundle
import android.os.FileObserver
import androidx.activity.enableEdgeToEdge
import com.cronos.todoapp.widget.CronosWidgetProvider
import com.cronos.todoapp.widget.WidgetRefresh
import java.io.File

class MainActivity : TauriActivity() {
  private var snapshotWatcher: FileObserver? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    watchWidgetSnapshot()
  }

  /**
   * 앱(JS)이 widget-snapshot.json 을 새로 쓰면 곧바로 홈 위젯을 다시 그린다.
   * Rust 는 임시 파일에 쓰고 rename 하므로 MOVED_TO 한 번으로 "바뀌었다" 를 안다.
   * 폴더 단위로 지켜보는 이유: 파일 단위 관찰은 rename 으로 바뀐 inode 를 놓친다.
   */
  private fun watchWidgetSnapshot() {
    val dir = File(applicationInfo.dataDir)
    @Suppress("DEPRECATION")
    snapshotWatcher = object : FileObserver(dir.absolutePath, MOVED_TO or CLOSE_WRITE) {
      override fun onEvent(event: Int, path: String?) {
        if (path == CronosWidgetProvider.SNAPSHOT_FILE) {
          WidgetRefresh.broadcast(this@MainActivity)
        }
      }
    }.also { it.startWatching() }
  }

  /**
   * 홈 위젯의 자동 갱신 주기는 최소 30분이라 앱에서 체크를 눌러도 한참 뒤에야 반영된다.
   * 앱을 벗어나는 순간이 곧 사용자가 홈 화면을 보는 순간이므로, 그때도 한 번 더 그린다.
   */
  override fun onPause() {
    super.onPause()
    WidgetRefresh.broadcast(this)
  }

  override fun onDestroy() {
    snapshotWatcher?.stopWatching()
    snapshotWatcher = null
    super.onDestroy()
  }
}
