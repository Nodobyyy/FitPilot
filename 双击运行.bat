@echo off
chcp 65001 > nul
REM FitPilot 快速启动脚本 (Windows)
REM 这个脚本会启动一个简单的HTTP服务器用于开发/测试

echo.
echo ========================================
echo   FitPilot - 快速启动脚本
echo ========================================
echo.

cd /d "%~dp0\web"

if not exist "index.html" (
    echo 错误：未找到 index.html 文件！
    echo 请确保在正确的目录中运行此脚本。
    pause
    exit /b 1
)

echo.
echo ✅ 文件检查成功！
echo.
echo 配置步骤：
echo 1. 打开 config.js 文件
echo 2. 修改 baseURL 为你的后端 API 地址
echo 3. 保存文件
echo.

echo 正在启动 HTTP 服务器...
echo.
echo 📍 访问地址：http://localhost:8000
echo 📍 登录页面：http://localhost:8000/login.html
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 自动打开浏览器
start http://localhost:8000

python ../server.py

if errorlevel 1 (
    echo.
    echo ❌ 错误：无法启动 HTTP 服务器
    echo.
    echo 可能的原因：
    echo - Python 未安装或未在 PATH 中
    echo - 端口 8000 已被占用
    echo.
    echo 解决方案：
    echo 1. 确保 Python 已安装：python --version
    echo 2. 如果端口被占用，修改端口号：python -m http.server 8001
    echo.
    pause
)
