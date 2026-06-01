@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===================================================
echo     FitPilot - GitHub 一键上传脚本
echo ===================================================
echo.

:: 检查是否安装了 Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Git！请先安装 Git: https://git-scm.com/
    pause
    exit /b
)

:: 检查是否已经初始化了 Git
if not exist ".git" (
    echo [状态] 正在初始化 Git 仓库...
    git init
    echo.
)

:: 提示输入 GitHub 仓库地址
set /p REPO_URL="请输入您的 GitHub 仓库地址 (例如: https://github.com/username/FitPilot.git): "

if "%REPO_URL%"=="" (
    echo [错误] 仓库地址不能为空！
    pause
    exit /b
)

:: 检查是否已存在 origin 远程仓库，存在则更新，不存在则添加
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo [状态] 正在更新远程仓库地址...
    git remote set-url origin %REPO_URL%
) else (
    echo [状态] 正在添加远程仓库...
    git remote add origin %REPO_URL%
)

:: 添加所有文件到暂存区
echo [状态] 正在添加文件...
git add .

:: 提示输入提交信息（默认为 Initial commit）
set /p COMMIT_MSG="请输入提交信息 (直接回车默认使用 'feat: FitPilot initial release'): "
if "!COMMIT_MSG!"=="" set COMMIT_MSG=feat: FitPilot initial release

:: 提交代码
echo [状态] 正在提交代码...
git commit -m "%COMMIT_MSG%"

:: 切换到主分支并推送
echo [状态] 正在推送到 GitHub...
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo     上传成功！🎉
    echo     您的代码已成功推送到: %REPO_URL%
    echo ===================================================
) else (
    echo.
    echo [错误] 推送失败，请检查网络、仓库地址或 GitHub 权限设置！
)

echo.
pause
