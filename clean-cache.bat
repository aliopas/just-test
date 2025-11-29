@echo off
echo Cleaning cache and build files...

REM Clean backend
if exist "backend\dist" (
    rmdir /s /q "backend\dist"
    echo Cleaned backend\dist
)

if exist "backend\.tsbuildinfo" (
    del /q "backend\.tsbuildinfo"
    echo Cleaned backend\.tsbuildinfo
)

REM Clean frontend
if exist "frontend\dist" (
    rmdir /s /q "frontend\dist"
    echo Cleaned frontend\dist
)

if exist "frontend\node_modules\.vite" (
    rmdir /s /q "frontend\node_modules\.vite"
    echo Cleaned frontend\node_modules\.vite
)

if exist "frontend\.vite" (
    rmdir /s /q "frontend\.vite"
    echo Cleaned frontend\.vite
)

REM Clean root cache
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Cleaned node_modules\.cache
)

if exist ".vite" (
    rmdir /s /q ".vite"
    echo Cleaned .vite
)

echo.
echo Cache cleaning completed!
pause

