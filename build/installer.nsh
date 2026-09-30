; electron-builder NSIS hook (package.json build.nsis.include).
;
; customInit runs in the NEW installer's .onInit, after initMultiUser has set
; $INSTDIR to the existing install, but BEFORE the old version is uninstalled.
; Versions up to 4.26.5 kept challenge history / LP history / achievement
; state in $INSTDIR\resources\app\server\data, which the update wipes. Copy it
; to the update-safe location (see server/lib/dataPaths.js) first - only if
; nothing is there yet, so an existing ttp-data is never overwritten.
!macro customInit
  ReadEnvStr $0 APPDATA
  IfFileExists "$INSTDIR\resources\app\server\data\*.*" 0 ttpDataRescueDone
  IfFileExists "$0\three-trick-pony-desktop\ttp-data\*.*" ttpDataRescueDone 0
  CreateDirectory "$0\three-trick-pony-desktop\ttp-data"
  CopyFiles /SILENT "$INSTDIR\resources\app\server\data\*.*" "$0\three-trick-pony-desktop\ttp-data"
  ttpDataRescueDone:
!macroend
