@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 IVR-sheet-checker GitHubリポジトリセットアップ
echo.

set /p GITHUB_USERNAME="GitHubユーザー名を入力してください: "

echo.
echo 📋 実行する手順:
echo 1. Gitリポジトリを初期化
echo 2. ファイルをステージング
echo 3. 初回コミット
echo 4. GitHubにプッシュ
echo.
set /p CONTINUE="続行しますか? (y/n): "

if /i not "%CONTINUE%"=="y" (
    echo ❌ キャンセルしました
    exit /b 1
)

echo.
echo 🔧 Gitリポジトリを初期化中...
git init

echo 📦 ファイルをステージング中...
git add .

echo 💾 初回コミット中...
git commit -m "Initial commit: IVR-sheet-checker v1.0.0" -m "Features:" -m "- Excel file upload with drag & drop" -m "- AI-powered typo detection using Gemini API" -m "- Smart filtering (exclude specific sheets and text patterns)" -m "- Compact display with collapsible sections" -m "- Auto-retry on rate limit errors" -m "- Support for shapes and textboxes in Excel"

echo 🔗 リモートリポジトリを追加中...
git remote add origin https://github.com/%GITHUB_USERNAME%/IVR-sheet-checker.git

echo 🌿 ブランチ名をmainに設定中...
git branch -M main

echo ⬆️ GitHubにプッシュ中...
git push -u origin main

echo.
echo ✅ セットアップ完了!
echo 🌐 リポジトリURL: https://github.com/%GITHUB_USERNAME%/IVR-sheet-checker
echo.
echo 📝 次のステップ:
echo 1. README.mdの 'YOUR_USERNAME' を実際のユーザー名に置き換え
echo 2. トピック（Topics）を追加: excel, gemini-api, ai, javascript, typo-checker
echo 3. (オプション) GitHub Pagesを有効化

pause
