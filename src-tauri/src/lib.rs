use tauri::Manager;
#[cfg(desktop)]
use tauri::{Emitter, WebviewWindowBuilder, WebviewUrl};
use std::sync::{Arc, Mutex};
use std::collections::HashSet;

#[cfg(debug_assertions)]
const BASE_URL: &str = "http://localhost:3000";

/// 열 수 있는 위젯 종류.
///
/// src/lib/widgetKinds.ts 와 src/app/widget/* 폴더와 반드시 같아야 한다.
/// 예전에는 여기에 화면 없는 이름(daily·upcoming·projectboard…)이 남아 있고
/// 정작 쓰는 이름(due·nownext·anniversary·projects)이 빠져 있어서,
/// 설정에서 그 넷을 열면 open_widget 이 조용히 거부했다.
/// 어긋나면 scripts/check-widget-kinds.mjs 가 빌드를 멈춘다.
#[cfg(desktop)]
const WIDGET_KINDS: &[&str] = &[
    "today", "quicktask", "due", "nownext",
    "weekly", "monthly", "anniversary",
    "projects", "challenge", "stats", "memo",
];

#[cfg(desktop)]
fn widget_size(kind: &str) -> (f64, f64) {
    const S: (f64, f64) = (200.0, 200.0);
    const W: (f64, f64) = (416.0, 200.0);
    const T: (f64, f64) = (200.0, 416.0);
    const M: (f64, f64) = (416.0, 416.0);
    const XW: (f64, f64) = (848.0, 200.0);

    match kind {
        "today"     => T,
        "quicktask" => T,
        "challenge" => T,
        "projects"  => T,
        "stats"     => S,
        "anniversary" => S,
        "due"       => S,
        "memo"      => W,
        "nownext"   => W,
        "monthly"   => M,
        "weekly"    => XW,
        _           => S,
    }
}

#[cfg(target_os = "windows")]
mod win32 {
    use std::ffi::c_void;
    pub type HWND = *mut c_void;

    pub const HWND_BOTTOM: HWND = 1usize as HWND;
    pub const SWP_POS_FLAGS: u32 = 0x0002 | 0x0001 | 0x0010;
    pub const GWL_EXSTYLE: i32 = -20;
    pub const WS_EX_NOACTIVATE: i32 = 0x0800_0000_u32 as i32;
    pub const DWMWA_TRANSITIONS_FORCEDISABLED: u32 = 3;
    pub const DWMWA_BORDER_COLOR: u32 = 34;
    pub const DWMWA_COLOR_NONE: u32 = 0xFFFF_FFFE;
    pub const DWMWA_COLOR_DEFAULT: u32 = 0xFFFF_FFFF;
    pub const DWMWA_DISALLOW_PEEK: u32 = 11;
    pub const GWLP_HWNDPARENT: i32 = -8;

    #[link(name = "user32")]
    extern "system" {
        pub fn SetWindowPos(
            hWnd: HWND, hWndInsertAfter: HWND,
            X: i32, Y: i32, cx: i32, cy: i32, uFlags: u32,
        ) -> i32;
        pub fn GetWindowLongW(hWnd: HWND, nIndex: i32) -> i32;
        pub fn SetWindowLongW(hWnd: HWND, nIndex: i32, dwNewLong: i32) -> i32;
        pub fn ShowWindow(hWnd: HWND, nCmdShow: i32) -> i32;
        pub fn IsIconic(hWnd: HWND) -> i32;
        pub fn SystemParametersInfoW(
            uiAction: u32,
            uiParam: u32,
            pvParam: *mut std::ffi::c_void,
            fWinIni: u32,
        ) -> i32;
        pub fn GetDesktopWindow() -> HWND;
        // ✅ 바탕화면(Progman)을 찾기 위한 API 추가
        pub fn FindWindowW(lpClassName: *const u16, lpWindowName: *const u16) -> HWND;
    }

    #[cfg(target_pointer_width = "64")]
    #[link(name = "user32")]
    extern "system" {
        pub fn SetWindowLongPtrW(hWnd: HWND, nIndex: i32, dwNewLong: isize) -> isize;
    }

    #[link(name = "dwmapi")]
    extern "system" {
        pub fn DwmSetWindowAttribute(
            hwnd: HWND, dwAttribute: u32,
            pvAttribute: *const std::ffi::c_void, cbAttribute: u32,
        ) -> i32;
    }

    pub type HKEY = *mut c_void;
    pub const HKEY_CURRENT_USER: HKEY = 0x80000001usize as _;
    pub const KEY_READ: u32 = 0x20019;
    pub const KEY_WRITE: u32 = 0x20006;

    #[link(name = "advapi32")]
    extern "system" {
        pub fn RegOpenKeyExW(
            hKey: HKEY, lpSubKey: *const u16,
            ulOptions: u32, samDesired: u32, phkResult: *mut HKEY,
        ) -> i32;
        pub fn RegQueryValueExW(
            hKey: HKEY, lpValueName: *const u16,
            lpReserved: *mut u32, lpType: *mut u32,
            lpData: *mut u8, lpcbData: *mut u32,
        ) -> i32;
        pub fn RegSetValueExW(
            hKey: HKEY, lpValueName: *const u16,
            Reserved: u32, dwType: u32,
            lpData: *const u8, cbData: u32,
        ) -> i32;
        pub fn RegDeleteValueW(
            hKey: HKEY, lpValueName: *const u16,
        ) -> i32;
        pub fn RegCloseKey(hKey: HKEY) -> i32;
    }

    pub unsafe fn write_reg_sz(subkey: &str, value: &str, data: &str) -> bool {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;

        let sk: Vec<u16> = OsStr::new(subkey).encode_wide().chain(Some(0)).collect();
        let vn: Vec<u16> = OsStr::new(value).encode_wide().chain(Some(0)).collect();
        let dt: Vec<u16> = OsStr::new(data).encode_wide().chain(Some(0)).collect();
        let dt_bytes: Vec<u8> = dt.iter().flat_map(|&w| w.to_le_bytes()).collect();

        let mut hk: HKEY = std::ptr::null_mut();
        if RegOpenKeyExW(HKEY_CURRENT_USER, sk.as_ptr(), 0, KEY_READ | KEY_WRITE, &mut hk) != 0 {
            return false;
        }
        let ret = RegSetValueExW(hk, vn.as_ptr(), 0, 1, dt_bytes.as_ptr(), dt_bytes.len() as u32);
        RegCloseKey(hk);
        ret == 0
    }

    pub unsafe fn delete_reg_value(subkey: &str, value: &str) -> bool {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;

        let sk: Vec<u16> = OsStr::new(subkey).encode_wide().chain(Some(0)).collect();
        let vn: Vec<u16> = OsStr::new(value).encode_wide().chain(Some(0)).collect();

        let mut hk: HKEY = std::ptr::null_mut();
        if RegOpenKeyExW(HKEY_CURRENT_USER, sk.as_ptr(), 0, KEY_READ | KEY_WRITE, &mut hk) != 0 {
            return false;
        }
        let ret = RegDeleteValueW(hk, vn.as_ptr());
        RegCloseKey(hk);
        ret == 0
    }

    pub unsafe fn read_reg_sz(subkey: &str, value: &str) -> Option<String> {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;

        let sk: Vec<u16> = OsStr::new(subkey).encode_wide().chain(Some(0)).collect();
        let vn: Vec<u16> = OsStr::new(value).encode_wide().chain(Some(0)).collect();

        let mut hk: HKEY = std::ptr::null_mut();
        if RegOpenKeyExW(HKEY_CURRENT_USER, sk.as_ptr(), 0, KEY_READ, &mut hk) != 0 {
            return None;
        }

        let mut sz: u32 = 0;
        RegQueryValueExW(hk, vn.as_ptr(), std::ptr::null_mut(), std::ptr::null_mut(), std::ptr::null_mut(), &mut sz);

        let mut buf: Vec<u8> = vec![0u8; sz as usize];
        let ret = RegQueryValueExW(hk, vn.as_ptr(), std::ptr::null_mut(), std::ptr::null_mut(), buf.as_mut_ptr(), &mut sz);
        RegCloseKey(hk);

        if ret != 0 || sz < 2 { return None; }

        let u16s: Vec<u16> = buf.chunks_exact(2)
            .map(|c| u16::from_le_bytes([c[0], c[1]]))
            .collect();
        let len = u16s.iter().position(|&c| c == 0).unwrap_or(u16s.len());
        String::from_utf16(&u16s[..len]).ok()
    }

    pub const SW_SHOWNOACTIVATE: i32 = 4;

    pub unsafe fn set_attr(hwnd: isize, attr: u32, val: u32) {
        DwmSetWindowAttribute(
            hwnd as HWND, attr,
            &val as *const u32 as *const _,
            std::mem::size_of::<u32>() as u32,
        );
    }

    pub unsafe fn set_noactivate(hwnd: isize, enable: bool) {
        let current = GetWindowLongW(hwnd as HWND, GWL_EXSTYLE);
        let new_style = if enable {
            current | WS_EX_NOACTIVATE
        } else {
            current & !WS_EX_NOACTIVATE
        };
        SetWindowLongW(hwnd as HWND, GWL_EXSTYLE, new_style);
    }

    pub const WM_WINDOWPOSCHANGING: u32 = 0x0046;
    pub const SWP_NOZORDER: u32 = 0x0004;
    const PIN_BOTTOM_ID: usize = 0xC1105;

    #[repr(C)]
    pub struct WINDOWPOS {
        pub hwnd: HWND,
        pub hwnd_insert_after: HWND,
        pub x: i32,
        pub y: i32,
        pub cx: i32,
        pub cy: i32,
        pub flags: u32,
    }

    pub type SubclassProc = unsafe extern "system" fn(HWND, u32, usize, isize, usize, usize) -> isize;

    #[link(name = "comctl32")]
    extern "system" {
        pub fn SetWindowSubclass(hWnd: HWND, pfnSubclass: SubclassProc, uIdSubclass: usize, dwRefData: usize) -> i32;
        pub fn RemoveWindowSubclass(hWnd: HWND, pfnSubclass: SubclassProc, uIdSubclass: usize) -> i32;
        pub fn DefSubclassProc(hWnd: HWND, uMsg: u32, wParam: usize, lParam: isize) -> isize;
    }

    // 창을 위로 올리려는 시도만 맨 아래로 바꿔치기한다.
    // 이동·크기 변경(SWP_NOZORDER)은 그대로 통과시켜야 한다.
    // 드래그 중에도 z순서를 강제하면 매 프레임 재배치가 일어나 심하게 깜빡인다.
    unsafe extern "system" fn pin_bottom_proc(
        hwnd: HWND, msg: u32, wparam: usize, lparam: isize,
        _id: usize, _data: usize,
    ) -> isize {
        if msg == WM_WINDOWPOSCHANGING && lparam != 0 {
            let wp = lparam as *mut WINDOWPOS;
            if (*wp).flags & SWP_NOZORDER == 0 {
                (*wp).hwnd_insert_after = HWND_BOTTOM;
            }
        }
        DefSubclassProc(hwnd, msg, wparam, lparam)
    }

    pub unsafe fn set_pin_bottom(hwnd: isize, enable: bool) {
        if enable {
            SetWindowSubclass(hwnd as HWND, pin_bottom_proc, PIN_BOTTOM_ID, 0);
            SetWindowPos(hwnd as HWND, HWND_BOTTOM, 0, 0, 0, 0, SWP_POS_FLAGS);
        } else {
            RemoveWindowSubclass(hwnd as HWND, pin_bottom_proc, PIN_BOTTOM_ID);
        }
    }

    pub unsafe fn remove_shadow_and_border(hwnd: isize) {
        set_attr(hwnd, 33, 1);
        set_attr(hwnd, DWMWA_BORDER_COLOR, DWMWA_COLOR_NONE);
        set_attr(hwnd, DWMWA_TRANSITIONS_FORCEDISABLED, 1);
        set_attr(hwnd, DWMWA_DISALLOW_PEEK, 1);
    }

    // ✅ Progman을 찾아 소유권을 넘겨 Win+D를 무시하게 만드는 핵심 로직
    pub unsafe fn bypass_win_d(hwnd: isize, enable: bool) {
        let owner = if enable {
            // "Progman" 이라는 진짜 윈도우 바탕화면 클래스 찾기
            let progman_class = [ 'P' as u16, 'r' as u16, 'o' as u16, 'g' as u16, 'm' as u16, 'a' as u16, 'n' as u16, 0 ];
            let mut p = FindWindowW(progman_class.as_ptr(), std::ptr::null());
            if p.is_null() {
                p = GetDesktopWindow(); // 최후의 보루
            }
            p
        } else {
            std::ptr::null_mut() // 우선순위가 바뀌면 다시 독립된 창으로 복귀
        };

        #[cfg(target_pointer_width = "64")]
        SetWindowLongPtrW(hwnd as HWND, GWLP_HWNDPARENT, owner as isize);

        #[cfg(target_pointer_width = "32")]
        SetWindowLongW(hwnd as HWND, GWLP_HWNDPARENT, owner as i32);
    }

    #[allow(dead_code)]
    pub unsafe fn set_dwm_border(hwnd: isize, show: bool) {
        let color: u32 = if show { DWMWA_COLOR_DEFAULT } else { DWMWA_COLOR_NONE };
        DwmSetWindowAttribute(
            hwnd as HWND, DWMWA_BORDER_COLOR,
            &color as *const u32 as *const _,
            std::mem::size_of::<u32>() as u32,
        );
    }
}

#[cfg(target_os = "windows")]
fn get_hwnd(win: &tauri::WebviewWindow) -> Option<isize> {
    use raw_window_handle::{HasWindowHandle, RawWindowHandle};
    win.window_handle().ok().and_then(|h| {
        if let RawWindowHandle::Win32(w) = h.as_raw() {
            Some(w.hwnd.get())
        } else {
            None
        }
    })
}

#[derive(Clone)]
pub struct BottomWidgets(pub Arc<Mutex<HashSet<String>>>);

#[tauri::command]
fn get_wallpaper_style() -> String {
    #[cfg(target_os = "windows")]
    unsafe {
        let tile = win32::read_reg_sz("Control Panel\\Desktop", "TileWallpaper")
            .unwrap_or_default();
        if tile.trim() == "1" {
            return "tile".into();
        }
        let style = win32::read_reg_sz("Control Panel\\Desktop", "WallpaperStyle")
            .unwrap_or_default();
        return match style.trim() {
            "0"  => "center",
            "2"  => "stretch",
            "6"  => "fit",
            "10" => "fill",
            "22" => "span",
            _    => "fill",
        }.into();
    }
    #[cfg(not(target_os = "windows"))]
    "fill".into()
}

#[tauri::command]
fn get_wallpaper_path() -> String {
    #[cfg(target_os = "windows")]
    {
        let mut path: [u16; 260] = [0; 260];
        let res = unsafe {
            win32::SystemParametersInfoW(
                0x0073,
                260,
                path.as_mut_ptr() as *mut std::ffi::c_void,
                0,
            )
        };
        if res != 0 {
            use std::os::windows::ffi::OsStringExt;
            let len = path.iter().position(|&c| c == 0).unwrap_or(260);
            let os_str = std::ffi::OsString::from_wide(&path[..len]);
            return os_str.into_string().unwrap_or_default();
        }
    }
    "".to_string()
}

#[cfg(target_os = "windows")]
const RUN_KEY: &str = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run";
#[cfg(target_os = "windows")]
const RUN_VALUE: &str = "CRONOS";

/// Run 키에 들어가는 값은 `"C:\...\CRONOS.exe" --from-autostart` 꼴이다.
/// 경로만 떼어낸다. 예전 코드는 trim_matches('"') 로 잘라서 뒤쪽 인자가
/// 그대로 붙어 있었고, 그래서 "지금 실행 파일과 같은지" 판정이 늘 거짓이었다.
/// 문자열만 다루는 함수라 어느 데스크톱에서나 컴파일된다 — autostart_status 가
/// 맥·리눅스에서도 부르므로 windows 로만 묶으면 거기서 빌드가 깨진다.
#[cfg(desktop)]
fn exe_from_run_value(value: &str) -> String {
    let v = value.trim();
    if let Some(rest) = v.strip_prefix('"') {
        if let Some(end) = rest.find('"') {
            return rest[..end].to_string();
        }
    }
    v.split_whitespace().next().unwrap_or("").to_string()
}

/// 부팅 자동 실행에 등록해도 되는 빌드인가.
///
/// 개발 빌드는 콘솔 프로그램이다 (windows_subsystem="windows" 를 릴리스에만
/// 걸어 두었다). 그걸 등록하면 컴퓨터를 켤 때마다 검은 터미널 창이 같이 뜬다.
/// 게다가 경로가 target/debug 라서 프로젝트를 옮기거나 지우면 부팅 때마다
/// 실패만 남는다. 그래서 개발 빌드는 아예 등록하지 않는다.
#[cfg(desktop)]
fn autostart_registrable() -> bool {
    !cfg!(debug_assertions)
}

/// 이미 등록돼 있는 자동 실행 항목이 엉뚱한 곳을 가리키면 바로잡는다.
///
/// - 릴리스로 돌고 있는데 등록된 경로가 다르면(업데이트·이사·개발 빌드 흔적)
///   지금 실행 파일로 다시 쓴다.
/// - 등록된 파일이 아예 없으면 지운다. 남겨 둬 봐야 부팅 때 오류만 난다.
#[cfg(all(desktop, target_os = "windows"))]
fn repair_autostart_entry() {
    let raw = match unsafe { win32::read_reg_sz(RUN_KEY, RUN_VALUE) } {
        Some(v) if !v.trim().is_empty() => v,
        _ => return,
    };

    let registered = exe_from_run_value(&raw);
    let current = std::env::current_exe()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();

    if registered.eq_ignore_ascii_case(current.trim()) {
        return;
    }

    if !std::path::Path::new(&registered).exists() {
        unsafe { win32::delete_reg_value(RUN_KEY, RUN_VALUE); }
        return;
    }

    if autostart_registrable() && !current.is_empty() {
        let quoted = format!("\"{current}\" --from-autostart");
        unsafe { win32::write_reg_sz(RUN_KEY, RUN_VALUE, &quoted); }
    }
}

#[cfg(all(desktop, not(target_os = "windows")))]
fn repair_autostart_entry() {}

#[cfg(desktop)]
#[tauri::command]
fn get_autostart(app: tauri::AppHandle) -> bool {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().is_enabled().unwrap_or(false)
}

/// UI 스위치가 OS 의 실제 등록 상태와 어긋나지 않도록, 등록 여부와
/// 실제로 등록된 실행 경로를 함께 돌려준다.
#[cfg(desktop)]
#[tauri::command]
fn autostart_status(app: tauri::AppHandle) -> serde_json::Value {
    use tauri_plugin_autostart::ManagerExt;
    let enabled = app.autolaunch().is_enabled().unwrap_or(false);
    let current = std::env::current_exe()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();

    #[cfg(target_os = "windows")]
    let registered = unsafe { win32::read_reg_sz(RUN_KEY, RUN_VALUE) };
    #[cfg(not(target_os = "windows"))]
    let registered: Option<String> = None;

    let normalized = registered.as_deref().map(exe_from_run_value);
    let matches_current = normalized
        .as_deref()
        .map(|s| s.eq_ignore_ascii_case(current.trim()))
        .unwrap_or(false);

    serde_json::json!({
        "enabled": enabled,
        "registeredPath": normalized,
        "currentExe": current,
        "matchesCurrent": matches_current,
    })
}

#[cfg(desktop)]
#[tauri::command]
fn set_autostart(app: tauri::AppHandle, enabled: bool) -> bool {
    use tauri_plugin_autostart::ManagerExt;
    let autolaunch = app.autolaunch();

    if !enabled {
        let ok = autolaunch.disable().is_ok();
        #[cfg(target_os = "windows")]
        unsafe { win32::delete_reg_value(RUN_KEY, RUN_VALUE); }
        return ok;
    }

    // 개발 빌드를 등록하면 부팅 때마다 터미널 창이 뜬다. 켜 주지 않는다.
    if !autostart_registrable() {
        let _ = autolaunch.disable();
        #[cfg(target_os = "windows")]
        unsafe { win32::delete_reg_value(RUN_KEY, RUN_VALUE); }
        return false;
    }

    let ok = autolaunch.enable().is_ok();

    // 경로에 공백이 있으면 따옴표 없이는 Windows 가 잘못 해석한다.
    #[cfg(target_os = "windows")]
    unsafe {
        if let Ok(exe) = std::env::current_exe() {
            let quoted = format!("\"{}\" --from-autostart", exe.to_string_lossy());
            win32::write_reg_sz(RUN_KEY, RUN_VALUE, &quoted);
        }
    }

    ok
}

#[cfg(desktop)]
fn launched_by_autostart() -> bool {
    std::env::args().any(|a| a == "--from-autostart")
}

/// 열려 있는 위젯 창이 하나라도 있는가.
#[cfg(desktop)]
fn any_widget_open(app: &tauri::AppHandle) -> bool {
    WIDGET_KINDS.iter().any(|k| app.get_webview_window(&format!("widget-{k}")).is_some())
}

/// tauri.conf.json 의 identifier 와 같아야 한다 — 설정 폴더 이름이 이것이다.
#[cfg(desktop)]
const APP_IDENTIFIER: &str = "com.cronos.todoapp";

/// "앱을 한 번 더 켰다" 는 쪽지가 놓이는 자리.
///
/// single-instance 플러그인은 두 번째 인스턴스를 곧바로 끝내면서 첫 인스턴스에 창 메시지를 보낸다.
/// 그 메시지는 두 경우에 사라진다 — (1) 첫 인스턴스가 아직 제 창을 만들기 전(부팅 직후 자동 실행과
/// 아이콘 클릭이 겹칠 때), (2) 두 프로세스의 권한이 다를 때(업데이트 설치 프로그램이 앱을 관리자로
/// 다시 띄운 뒤 사용자가 바로가기로 켜면 UIPI 가 낮은 쪽의 메시지를 막는다).
/// 그러면 아이콘을 눌러도 아무 일도 안 일어난다 — "위젯만 떠 있고 앱이 안 켜진다" 가 이것이다.
/// 그래서 메시지와 별개로 파일에도 남긴다. 파일은 권한이 달라도 같은 사용자 폴더라 읽고 쓸 수 있다.
#[cfg(desktop)]
fn launch_request_path() -> Option<std::path::PathBuf> {
    #[cfg(target_os = "windows")]
    let base = std::env::var_os("APPDATA").map(std::path::PathBuf::from);
    #[cfg(target_os = "macos")]
    let base = std::env::var_os("HOME").map(|h| std::path::PathBuf::from(h).join("Library/Application Support"));
    #[cfg(all(not(target_os = "windows"), not(target_os = "macos")))]
    let base = std::env::var_os("XDG_CONFIG_HOME")
        .map(std::path::PathBuf::from)
        .or_else(|| std::env::var_os("HOME").map(|h| std::path::PathBuf::from(h).join(".config")));
    Some(base?.join(APP_IDENTIFIER).join("launch-request.json"))
}

#[cfg(desktop)]
fn now_ms() -> u128 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0)
}

/// 켤 때마다 쪽지를 남긴다 (첫 인스턴스든 두 번째든). 첫 인스턴스는 제 pid 를 보고 제 것을 건너뛴다.
#[cfg(desktop)]
fn write_launch_request() {
    let Some(path) = launch_request_path() else { return };
    if let Some(dir) = path.parent() {
        let _ = std::fs::create_dir_all(dir);
    }
    let body = format!(
        "{{\"pid\":{},\"ts\":{},\"autostart\":{}}}",
        std::process::id(),
        now_ms(),
        launched_by_autostart(),
    );
    // 반쪽짜리 파일을 읽지 않도록 임시 파일에 쓰고 바꿔 끼운다
    let tmp = path.with_extension("json.tmp");
    if std::fs::write(&tmp, body).is_ok() {
        let _ = std::fs::rename(&tmp, &path);
    }
}

/// 쪽지 읽기 — (pid, 시각(ms), 자동 실행인가)
#[cfg(desktop)]
fn read_launch_request() -> Option<(u32, u128, bool)> {
    let text = std::fs::read_to_string(launch_request_path()?).ok()?;
    let v: serde_json::Value = serde_json::from_str(&text).ok()?;
    Some((
        v.get("pid")?.as_u64()? as u32,
        v.get("ts")?.as_u64()? as u128,
        v.get("autostart").and_then(|b| b.as_bool()).unwrap_or(false),
    ))
}

/// 메인 창을 앞으로 가져온다. 없으면(닫혔으면) 설정 그대로 다시 만든다.
///
/// 위젯이 떠 있는 동안 메인 창을 닫으면 프로세스는 위젯 때문에 살아 있다.
/// 그 상태에서 앱 아이콘을 누르면 두 번째 인스턴스가 여기로 넘겨주는데,
/// 예전에는 "main" 이 없으면 아무것도 하지 않아서 앱이 안 켜지는 것처럼 보였다.
#[cfg(desktop)]
fn show_main_window(app: &tauri::AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.unminimize();
        let _ = win.show();
        let _ = win.set_focus();
        return;
    }
    let Some(cfg) = app.config().app.windows.first().cloned() else { return; };
    match tauri::WebviewWindowBuilder::from_config(app, &cfg) {
        Ok(builder) => match builder.build() {
            Ok(win) => {
                let _ = win.show();
                let _ = win.set_focus();
                attach_main_close_guard(app, &win);
            }
            Err(e) => eprintln!("[main] 창을 다시 만들지 못했다: {e}"),
        },
        Err(e) => eprintln!("[main] 창 설정을 읽지 못했다: {e}"),
    }
}

/// 메인 창의 닫기: 위젯이 떠 있으면 숨기기만 한다 (위젯이 계속 살아야 하니까).
/// 위젯이 없으면 그대로 닫히고, 마지막 창이라 앱이 끝난다.
#[cfg(desktop)]
fn attach_main_close_guard(app: &tauri::AppHandle, win: &tauri::WebviewWindow) {
    let app = app.clone();
    let me = win.clone();
    win.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            if any_widget_open(&app) {
                api.prevent_close();
                let _ = me.hide();
            }
        }
    });
}

#[cfg(desktop)]
#[tauri::command]
async fn open_widget(
    app: tauri::AppHandle,
    kind: String,
    x: Option<f64>,
    y: Option<f64>,
    w: Option<f64>,
    h: Option<f64>,
) -> Result<(), String> {
    if !WIDGET_KINDS.contains(&kind.as_str()) {
        return Err(format!("알 수 없는 위젯 종류: {kind}"));
    }

    let label = format!("widget-{kind}");

    if let Some(win) = app.get_webview_window(&label) {
        let _ = win.set_focus();
        return Ok(());
    }

    let (dw, dh) = widget_size(&kind);
    let (w, h) = (w.unwrap_or(dw), h.unwrap_or(dh));

    // 저장된 좌표가 지금 연결된 모니터 밖이면 버린다 (부팅 시 모니터 구성이 다를 수 있다)
    let pos = match (x, y) {
        (Some(px), Some(py)) => {
            let inside = app.available_monitors().map(|monitors| {
                monitors.iter().any(|m| {
                    let sf = m.scale_factor();
                    let mx = m.position().x as f64 / sf;
                    let my = m.position().y as f64 / sf;
                    let mw = m.size().width as f64 / sf;
                    let mh = m.size().height as f64 / sf;
                    px >= mx - 8.0 && py >= my - 8.0 && px < mx + mw - 40.0 && py < my + mh - 40.0
                })
            }).unwrap_or(false);
            if inside { Some((px, py)) } else { None }
        }
        _ => None,
    };

    #[cfg(debug_assertions)]
    let webview_url = {
        let url_str = format!("{BASE_URL}/widget/{kind}");
        let parsed = url_str.parse::<url::Url>().map_err(|e| e.to_string())?;
        WebviewUrl::External(parsed)
    };

    #[cfg(not(debug_assertions))]
    let webview_url = WebviewUrl::App(format!("widget/{kind}/").into());

    let app2 = app.clone();
    let kind_for_cleanup = kind.clone();
    let (tx, rx) = tokio::sync::oneshot::channel::<Result<(), String>>();

    app.run_on_main_thread(move || {
        // 메인 스레드에서 한 번 더 확인해야 동시 호출로 두 번 만들어지지 않는다
        if app2.get_webview_window(&label).is_some() {
            let _ = tx.send(Ok(()));
            return;
        }

        // 로딩 중 위젯이 화면을 가리지 않도록 맨 아래에서 시작한다.
        // 실제 우선순위는 로드 후 set_widget_priority 가 다시 적용한다.
        let mut builder = WebviewWindowBuilder::new(&app2, &label, webview_url)
            .title("")
            .transparent(true)
            .shadow(false)
            .decorations(false)
            .always_on_top(false)
            .skip_taskbar(true)
            .resizable(true)
            .visible(true)
            .inner_size(w, h)
            .min_inner_size(160.0, 120.0);

        if let Some((px, py)) = pos {
            builder = builder.position(px, py);
        }

        match builder.build()
        {
            Ok(win)  => {
                let _ = win.show();
                #[cfg(target_os = "windows")]
                if let Some(hwnd) = get_hwnd(&win) {
                    unsafe {
                        win32::remove_shadow_and_border(hwnd);
                        win32::bypass_win_d(hwnd, true); // 생성 시 바탕화면 고정 켜기
                        win32::set_noactivate(hwnd, true);
                        win32::set_pin_bottom(hwnd, true);
                    }
                }
                // 창이 어떤 경로로 닫히든 bottom 목록에서 빠지게 한다
                {
                    let bottom = app2.state::<BottomWidgets>().0.clone();
                    let closed_kind = kind_for_cleanup.clone();
                    let app_for_exit = app2.clone();
                    win.on_window_event(move |event| {
                        // 사람이 위젯 창을 닫으면(Alt+F4·위젯의 ✕) 본 창에 알려 "열려 있음" 표시를 지운다 — 예전엔 Alt+F4 로 닫으면
                        // 표시가 남아 다음 부팅에 다시 떴다. 앱을 끝낼 때(트레이의 끝내기·윈도우 종료)는 이 이벤트가 오지 않아 다음에 그대로 되살아난다
                        if matches!(event, tauri::WindowEvent::CloseRequested { .. }) {
                            let _ = app_for_exit.emit_to("main", "widget-closed", closed_kind.clone());
                        }
                        if matches!(event, tauri::WindowEvent::Destroyed) {
                            if let Ok(mut set) = bottom.lock() {
                                set.remove(&closed_kind);
                            }
                            // 마지막 위젯이 닫혔고 메인 창은 숨어 있다면, 보이지 않는 프로세스만
                            // 남는다. 그건 사용자가 끈 것이나 마찬가지이므로 앱을 끝낸다.
                            let main_hidden = app_for_exit
                                .get_webview_window("main")
                                .map(|w| !w.is_visible().unwrap_or(true))
                                .unwrap_or(true);
                            // 지금 닫히는 창은 아직 목록에 남아 있을 수 있어 이름으로 뺀다
                            let others_open = WIDGET_KINDS.iter().any(|k| {
                                *k != closed_kind.as_str()
                                    && app_for_exit.get_webview_window(&format!("widget-{k}")).is_some()
                            });
                            if main_hidden && !others_open {
                                app_for_exit.exit(0);
                            }
                        }
                    });
                }

                let _ = tx.send(Ok(()));
            }
            Err(e) => { let _ = tx.send(Err(e.to_string())); },
        }
    }).map_err(|e| e.to_string())?;

    rx.await.map_err(|e| e.to_string())?
}

#[cfg(desktop)]
#[tauri::command]
async fn set_widget_priority(
    app: tauri::AppHandle,
    bottom_state: tauri::State<'_, BottomWidgets>,
    kind: String,
    priority: String,
) -> Result<(), String> {
    let label = format!("widget-{kind}");

    {
        let mut set = bottom_state.0.lock().unwrap();
        if priority == "bottom" {
            set.insert(kind.clone());
        } else {
            set.remove(&kind);
        }
    }

    if let Some(win) = app.get_webview_window(&label) {
        match priority.as_str() {
            "top" => {
                win.set_always_on_top(true).map_err(|e| e.to_string())?;
                #[cfg(target_os = "windows")]
                if let Some(hwnd) = get_hwnd(&win) {
                    win.run_on_main_thread(move || unsafe {
                        win32::set_pin_bottom(hwnd, false);
                        win32::bypass_win_d(hwnd, false);
                        win32::set_noactivate(hwnd, false);
                    }).map_err(|e| e.to_string())?;
                }
            }
            "bottom" => {
                win.set_always_on_top(false).map_err(|e| e.to_string())?;
                #[cfg(target_os = "windows")]
                if let Some(hwnd) = get_hwnd(&win) {
                    win.run_on_main_thread(move || unsafe {
                        win32::bypass_win_d(hwnd, true); // 바탕화면일 때만 켜기
                        // NOACTIVATE 를 걸면 위젯이 키보드 포커스를 못 받아 입력이 불가능해진다.
                        // z-order 는 set_pin_bottom 의 서브클래싱이 따로 잡으므로 필요 없다.
                        win32::set_noactivate(hwnd, false);
                        win32::set_pin_bottom(hwnd, true);
                    }).map_err(|e| e.to_string())?;
                }
            }
            _ => {
                win.set_always_on_top(false).map_err(|e| e.to_string())?;
                #[cfg(target_os = "windows")]
                if let Some(hwnd) = get_hwnd(&win) {
                    win.run_on_main_thread(move || unsafe {
                        win32::set_pin_bottom(hwnd, false);
                        win32::bypass_win_d(hwnd, false);
                        win32::set_noactivate(hwnd, false);
                    }).map_err(|e| e.to_string())?;
                }
            }
        }
    }
    Ok(())
}

#[cfg(desktop)]
#[tauri::command]
async fn set_widget_locked(
    app: tauri::AppHandle,
    kind: String,
    locked: bool,
) -> Result<(), String> {
    let label = format!("widget-{kind}");
    let Some(win) = app.get_webview_window(&label) else { return Ok(()); };

    let _ = win;
    let _ = locked;
    Ok(())
}

#[cfg(desktop)]
#[tauri::command]
async fn close_widget(
    app: tauri::AppHandle,
    bottom_state: tauri::State<'_, BottomWidgets>,
    kind: String,
) -> Result<(), String> {
    {
        let mut set = bottom_state.0.lock().unwrap();
        set.remove(&kind);
    }
    let label = format!("widget-{kind}");
    if let Some(win) = app.get_webview_window(&label) {
        win.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg(desktop)]
#[tauri::command]
fn list_open_widgets(app: tauri::AppHandle) -> Vec<String> {
    WIDGET_KINDS
        .iter()
        .filter(|&&k| app.get_webview_window(&format!("widget-{k}")).is_some())
        .map(|&k| k.to_string())
        .collect()
}

fn widget_state_path(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    app.path().app_config_dir().ok().map(|d| d.join("widget-state.json"))
}

#[tauri::command]
fn load_widget_state(app: tauri::AppHandle) -> String {
    widget_state_path(&app)
        .and_then(|p| std::fs::read_to_string(p).ok())
        .unwrap_or_else(|| "{}".to_string())
}

#[tauri::command]
fn save_widget_state(app: tauri::AppHandle, state: String) -> bool {
    let Some(path) = widget_state_path(&app) else { return false };
    if let Some(dir) = path.parent() {
        let _ = std::fs::create_dir_all(dir);
    }
    // 임시 파일에 쓰고 교체해야 도중에 죽어도 반쪽짜리 JSON 이 남지 않는다
    let tmp = path.with_extension("json.tmp");
    if std::fs::write(&tmp, state).is_err() {
        return false;
    }
    std::fs::rename(&tmp, &path).is_ok()
}

/// 안드로이드 홈 위젯이 읽는 자료 (오늘 할 일·챌린지·문구).
///
/// 홈 위젯은 WebView 를 담을 수 없어 네이티브(RemoteViews)로 그린다. 그 재료를
/// 앱(JS)이 여기로 넘기면 파일에 두고, Kotlin 쪽(CronosWidgetProvider)이 읽어 그린다.
/// 데스크톱에서는 부르지 않지만 명령이 있어도 해가 없다.
fn widget_snapshot_path(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    app.path().app_config_dir().ok().map(|d| d.join("widget-snapshot.json"))
}

#[tauri::command]
fn save_widget_snapshot(app: tauri::AppHandle, snapshot: String) -> bool {
    let Some(path) = widget_snapshot_path(&app) else { return false };
    if let Some(dir) = path.parent() {
        let _ = std::fs::create_dir_all(dir);
    }
    // 임시 파일에 쓰고 교체한다. 위젯이 반쪽짜리 JSON 을 읽지 않고, MainActivity 의
    // FileObserver 가 MOVED_TO 한 번으로 "바뀌었다" 를 안다.
    let tmp = path.with_extension("json.tmp");
    if std::fs::write(&tmp, snapshot).is_err() {
        return false;
    }
    std::fs::rename(&tmp, &path).is_ok()
}

/// 안드로이드 홈 위젯이 앱을 열며 남긴 `cronos://…` 링크를 가져오고 지운다.
/// MainActivity(Kotlin)가 pending-link.txt 에 적고, JS(AndroidWidgetSync)가 켜질 때·다시 보일 때 가져간다.
/// Kotlin → JS 로 바로 부를 길이 없어 파일로 건넨다. 데스크톱에서는 늘 None.
#[tauri::command]
fn take_pending_link(app: tauri::AppHandle) -> Option<String> {
    let path = app.path().app_config_dir().ok()?.join("pending-link.txt");
    let link = std::fs::read_to_string(&path).ok()?;
    let _ = std::fs::remove_file(&path);
    let link = link.trim().to_string();
    if link.is_empty() { None } else { Some(link) }
}

/// 이 프로세스가 켜진 순간에 정해지는 값. 모든 창(메인·위젯)이 같은 값을 받는다.
///
/// "로그인 유지" 를 끈 사람은 앱을 다시 켤 때 로그아웃돼 있어야 한다. 그런데 창이 새로 뜨는
/// 것만으로는 "앱을 다시 켰다" 와 "켜 둔 앱에서 위젯 창을 하나 더 열었다" 를 가를 수 없다.
/// 웹뷰는 localStorage 를 나눠 쓰므로, 거기 적힌 값과 이 값이 다르면 새로 켠 것이다.
#[tauri::command]
fn launch_id() -> String {
    static ID: std::sync::OnceLock<String> = std::sync::OnceLock::new();
    ID.get_or_init(|| {
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0);
        format!("{}-{:x}", std::process::id(), nanos)
    })
    .clone()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let bottom_widgets = BottomWidgets(Arc::new(Mutex::new(HashSet::new())));

    // 켜진 순간에 쪽지부터 남긴다. 두 번째 인스턴스는 곧 아래 플러그인이 끝내 버리므로
    // 그 전에 적어 둬야 첫 인스턴스가 "누가 또 켰다" 를 안다 (launch_request_path 의 설명)
    #[cfg(desktop)]
    write_launch_request();

    let builder = tauri::Builder::default();

    #[cfg(desktop)]
    // 두 번째 인스턴스는 즉시 종료된다. 없으면 위젯이 인스턴스 수만큼 중복 생성된다.
    // 플러그인 문서대로 맨 앞에 건다 — 뒤에 걸면 곧 끝날 인스턴스가 업데이터·자동 실행까지 건드린다.
    let builder = builder
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            show_main_window(app);
        }))
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--from-autostart"]),
        ));

    let builder = builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init());

    builder
        .manage(bottom_widgets.clone())
        .invoke_handler({
            #[cfg(desktop)]
            {
                tauri::generate_handler![
                    open_widget,
                    close_widget,
                    list_open_widgets,
                    set_widget_priority,
                    set_widget_locked,
                    get_wallpaper_path,
                    get_wallpaper_style,
                    get_autostart,
                    set_autostart,
                    autostart_status,
                    load_widget_state,
                    save_widget_state,
                    save_widget_snapshot,
                    launch_id,
                    take_pending_link,
                ]
            }
            #[cfg(not(desktop))]
            {
                tauri::generate_handler![
                    get_wallpaper_path,
                    get_wallpaper_style,
                    load_widget_state,
                    save_widget_state,
                    save_widget_snapshot,
                    launch_id,
                    take_pending_link,
                ]
            }
        })
        .setup(move |app| {
            // 남아 있는 자동 실행 항목이 엉뚱한 실행 파일을 가리키면 여기서 바로잡는다.
            #[cfg(desktop)]
            repair_autostart_entry();

            // 누가 앱을 한 번 더 켰는지 지켜본다 (창 메시지가 막혀도 이쪽으로 뜬다)
            #[cfg(desktop)]
            {
                let app_handle = app.handle().clone();
                let me = std::process::id();
                let started = now_ms();
                tauri::async_runtime::spawn(async move {
                    let mut last = started;
                    loop {
                        tokio::time::sleep(tokio::time::Duration::from_millis(700)).await;
                        let Some((pid, ts, autostart)) = read_launch_request() else { continue };
                        // 내가 켜면서 남긴 쪽지, 오래된 쪽지, 부팅 자동 실행은 창을 띄우지 않는다
                        if pid == me || ts <= last || autostart { continue; }
                        last = ts;
                        let h = app_handle.clone();
                        let _ = app_handle.run_on_main_thread(move || show_main_window(&h));
                    }
                });
            }

            #[cfg(desktop)]
            {
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    loop {
                        // 위젯이 하나도 없으면 굳이 500ms 마다 돌 필요가 없다
                        let any_open = WIDGET_KINDS.iter().any(|k| {
                            app_handle.get_webview_window(&format!("widget-{k}")).is_some()
                        });
                        let interval = if any_open { 500 } else { 3000 };
                        tokio::time::sleep(tokio::time::Duration::from_millis(interval)).await;

                        for &kind in WIDGET_KINDS {
                            if let Some(win) = app_handle
                                .get_webview_window(&format!("widget-{kind}"))
                            {
                                #[cfg(target_os = "windows")]
                                if let Some(hwnd) = get_hwnd(&win) {
                                    unsafe {
                                        // Win+D / 바탕화면 보기로 최소화된 경우만 되살린다.
                                        // 숨김(hidden)은 앱이 의도적으로 감춘 상태일 수 있어 건드리지 않는다.
                                        if win32::IsIconic(hwnd as _) != 0 {
                                            win32::ShowWindow(hwnd as _, win32::SW_SHOWNOACTIVATE);
                                        }
                                    }
                                }
                            }
                        }

                    }
                });
            }

            // 부팅 자동 실행이면 큰 메인 창을 띄우지 않는다 (위젯만 복원).
            // 앱 아이콘을 다시 실행하면 single-instance 핸들러가 메인 창을 띄워준다.
            #[cfg(desktop)]
            if let Some(win) = app.get_webview_window("main") {
                attach_main_close_guard(&app.handle().clone(), &win);
                if launched_by_autostart() {
                    let _ = win.hide();
                } else {
                    let _ = win.show();
                }
            }
            let _ = app;
            Ok(())
        })
        .run(tauri::generate_context!())
        .unwrap();
}