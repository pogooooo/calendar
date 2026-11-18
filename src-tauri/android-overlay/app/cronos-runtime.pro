# Tauri calls this method from Rust through JNI during startup.
# Keep it even when a cached Rust build skips generated ProGuard files.
-keep class com.cronos.todoapp.TauriActivity {
    public app.tauri.plugin.PluginManager getPluginManager();
}
