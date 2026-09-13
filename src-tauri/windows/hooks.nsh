; CRONOS NSIS 설치 훅 — tauri.conf.json 의 bundle.windows.nsis.installerHooks 로 걸린다.
;
; 자동 업데이트로 앱을 덮어쓰면 실행 파일 경로가 그대로라 윈도우가 예전 아이콘을
; 캐시에서 계속 꺼내 준다 (v1.0.0 에서 아이콘을 바꿨는데 바탕화면·작업 표시줄엔
; 옛 그림이 남았다). 설치가 끝나면 셸에 "연결이 바뀌었다"고 알리고 아이콘 캐시를
; 다시 세우게 해서, 다음 그리기부터 새 아이콘이 나오게 한다.

!macro NSIS_HOOK_POSTINSTALL
  ; SHCNE_ASSOCCHANGED (0x08000000) + SHCNF_IDLIST (0) + SHCNF_FLUSH (0x1000)
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0x1000, p 0, p 0)'
  ; Windows 10+ 의 아이콘 캐시 재구성. 없거나 실패해도 설치는 계속된다.
  nsExec::ExecToLog '"$SYSDIR\ie4uinit.exe" -show'
  Pop $0
!macroend
