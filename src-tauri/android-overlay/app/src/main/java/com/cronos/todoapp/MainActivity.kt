package com.cronos.todoapp

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import com.cronos.todoapp.widget.WidgetRefresh

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  /**
   * 홈 위젯의 자동 갱신 주기는 최소 30분이라 앱에서 체크를 눌러도 한참 뒤에야 반영된다.
   * 앱을 벗어나는 순간이 곧 사용자가 홈 화면을 보는 순간이므로, 그때 위젯을 다시 그린다.
   */
  override fun onPause() {
    super.onPause()
    WidgetRefresh.broadcast(this)
  }
}
