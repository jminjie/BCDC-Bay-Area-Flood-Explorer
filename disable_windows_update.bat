@echo off
:: ============================================================
:: disable_windows_update.bat
:: Disables Windows Update on Windows 10/11
:: Must be run as Administrator
:: ============================================================

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This script must be run as Administrator.
    echo Right-click the script and select "Run as administrator".
    pause
    exit /b 1
)

echo ============================================================
echo  Disabling Windows Update...
echo ============================================================
echo.

:: --- 1. Stop and disable Windows Update services ---
echo [1/4] Stopping and disabling Windows Update services...

sc stop wuauserv >nul 2>&1
sc config wuauserv start= disabled >nul 2>&1
echo   - Windows Update (wuauserv)        [DISABLED]

sc stop UsoSvc >nul 2>&1
sc config UsoSvc start= disabled >nul 2>&1
echo   - Update Orchestrator (UsoSvc)     [DISABLED]

sc stop WaaSMedicSvc >nul 2>&1
sc config WaaSMedicSvc start= disabled >nul 2>&1
echo   - WaaSMedic (WaaSMedicSvc)         [DISABLED]

sc stop bits >nul 2>&1
sc config bits start= disabled >nul 2>&1
echo   - Background Transfer (bits)       [DISABLED]

sc stop dosvc >nul 2>&1
sc config dosvc start= disabled >nul 2>&1
echo   - Delivery Optimization (dosvc)    [DISABLED]

echo.

:: --- 2. Apply Group Policy registry keys ---
echo [2/4] Applying Group Policy registry settings...

reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v NoAutoUpdate /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v AUOptions /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" /v DisableWindowsUpdateAccess /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update" /v AUOptions /t REG_DWORD /d 1 /f >nul
echo   - Registry policies applied        [DONE]

echo.

:: --- 3. Block Windows Update via hosts file ---
echo [3/4] Blocking Windows Update hosts...

set HOSTS=%SystemRoot%\System32\drivers\etc\hosts
findstr /C:"windowsupdate.microsoft.com" "%HOSTS%" >nul 2>&1
if %errorlevel% neq 0 (
    echo. >> "%HOSTS%"
    echo # Windows Update blocked by disable_windows_update.bat >> "%HOSTS%"
    echo 0.0.0.0 windowsupdate.microsoft.com >> "%HOSTS%"
    echo 0.0.0.0 update.microsoft.com >> "%HOSTS%"
    echo 0.0.0.0 download.windowsupdate.com >> "%HOSTS%"
    echo 0.0.0.0 windowsupdate.com >> "%HOSTS%"
    echo   - Hosts file updated               [DONE]
) else (
    echo   - Hosts entries already present    [SKIPPED]
)

echo.

:: --- 4. Disable Windows Update scheduled tasks ---
echo [4/4] Disabling Windows Update scheduled tasks...

schtasks /Change /TN "\Microsoft\Windows\WindowsUpdate\Scheduled Start" /Disable >nul 2>&1
echo   - Scheduled Start task             [DISABLED]

schtasks /Change /TN "\Microsoft\Windows\UpdateOrchestrator\Schedule Scan" /Disable >nul 2>&1
echo   - Schedule Scan task               [DISABLED]

schtasks /Change /TN "\Microsoft\Windows\UpdateOrchestrator\USO_UxBroker" /Disable >nul 2>&1
echo   - USO_UxBroker task                [DISABLED]

schtasks /Change /TN "\Microsoft\Windows\UpdateOrchestrator\Report policies" /Disable >nul 2>&1
echo   - Report policies task             [DISABLED]

echo.
echo ============================================================
echo  Windows Update has been disabled successfully.
echo  It is recommended to reboot for all changes to take effect.
echo ============================================================
echo.
pause
