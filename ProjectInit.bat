@echo off
setlocal enabledelayedexpansion

:: Error Messages
set "Error0=Name Already Used"
set "Error1=Unknown Template"

:CheckProjectsDir
if not exist "Projects" mkdir "Projects"

:: Parse Arguments
set "name="
set "template="
set "selectedTemplate="

:ParseArgs
if "%~1"=="" goto Start
if /i "%~1"=="-n" set "name=%~2" & shift & shift & goto ParseArgs
if /i "%~1"=="--name" set "name=%~2" & shift & shift & goto ParseArgs
if /i "%~1"=="-t" set "template=%~2" & shift & shift & goto ParseArgs
if /i "%~1"=="--template" set "template=%~2" & shift & shift & goto ParseArgs
if /i "%~1"=="-?" goto Help
if /i "%~1"=="--help" goto Help
echo Invalid argument: "%~1"
exit /b 1

:Help
echo +--------------------------------------------+
echo ^| ProjectInit arguments:                     ^|
echo +--------------------------------------------+
echo ^| short ^| long        ^| Description          ^|
echo +--------------------------------------------+
echo ^| -n    ^| --name      ^| pre-set name         ^|
echo ^| -t    ^| --template  ^| pre-set template     ^|
echo ^| -?    ^| --help      ^| display this message ^|
echo +--------------------------------------------+
exit /b 0

:Start
if not defined name (
    set /p "name=Enter name of project: "
)

if exist "Projects\%name%" (
    echo Error: %Error0%
    exit /b 1
)

:: Detect Templates
set "templateList=default"
set "tmpl[0]=default"
set /a index=1

for /d %%i in (Templates\*) do (
    if /i not "%%~nxi"=="default" (
        set "tmpl[!index!]=%%~nxi"
        set "templateList=!templateList! %%~nxi"
        set /a index+=1
    )
)

if not defined template (
    echo Detected templates:
    set /a i=0
    for %%t in (%templateList%) do (
        echo !i! - %%t
        set "tmpl[!i!]=%%t"
        set /a i+=1
    )

    set /p "template=Enter template number (default=0): "
    if not defined template set "template=0"
)

:: Check if input is a number
for /L %%i in (0,1,9) do (
    if "!template!"=="%%i" set "selectedTemplate=!tmpl[%%i]!"
)

if not defined selectedTemplate set "selectedTemplate=%template%"

if not exist "Templates\%selectedTemplate%" (
    echo Error: %Error1%
    exit /b 1
)

echo:
echo Copying template files..
:: Copy Template
xcopy /E /I /Q "Templates\%selectedTemplate%" "Projects\%name%"

echo:
set "templateName=.template.config"
set "shouldDelete=0"

:: Handle TEMPLATE_CONFIG
if exist "Projects\%name%\%templateName%" (
    echo Found template file.
    for /f "tokens=1,2 delims==" %%A in (Projects\%name%\%templateName%) do (
        if /i "%%A"=="EnginePath" (
            echo Copying game engine to: Projects/%name%/%%B
            copy "GameEngine.js" "Projects\%name%\%%B"
        )
		if /i "%%A"=="DeleteOnInit" (
            set "shouldDelete=%%B"
        )
    )
    if "!shouldDelete!"=="1" (
		echo Deleting template config from project folder
        del "Projects\%name%\%templateName%"
    )
)
echo:
echo Project "%name%" created successfully.
exit /b 0