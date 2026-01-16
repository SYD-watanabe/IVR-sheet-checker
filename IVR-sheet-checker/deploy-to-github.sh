#!/bin/bash

# IVR-sheet-checker GitHubリポジトリ作成スクリプト

echo "🚀 IVR-sheet-checker GitHubリポジトリセットアップ"
echo ""

# GitHubユーザー名を入力
read -p "GitHubユーザー名を入力してください: " GITHUB_USERNAME

echo ""
echo "📋 実行する手順:"
echo "1. Gitリポジトリを初期化"
echo "2. ファイルをステージング"
echo "3. 初回コミット"
echo "4. GitHubにプッシュ"
echo ""
read -p "続行しますか? (y/n): " CONTINUE

if [ "$CONTINUE" != "y" ]; then
    echo "❌ キャンセルしました"
    exit 1
fi

echo ""
echo "🔧 Gitリポジトリを初期化中..."
git init

echo "📦 ファイルをステージング中..."
git add .

echo "💾 初回コミット中..."
git commit -m "Initial commit: IVR-sheet-checker v1.0.0

Features:
- Excel file upload with drag & drop
- AI-powered typo detection using Gemini API
- Smart filtering (exclude specific sheets and text patterns)
- Compact display with collapsible sections
- Auto-retry on rate limit errors
- Support for shapes and textboxes in Excel"

echo "🔗 リモートリポジトリを追加中..."
git remote add origin "https://github.com/${GITHUB_USERNAME}/IVR-sheet-checker.git"

echo "🌿 ブランチ名をmainに設定中..."
git branch -M main

echo "⬆️ GitHubにプッシュ中..."
git push -u origin main

echo ""
echo "✅ セットアップ完了!"
echo "🌐 リポジトリURL: https://github.com/${GITHUB_USERNAME}/IVR-sheet-checker"
echo ""
echo "📝 次のステップ:"
echo "1. README.mdの 'YOUR_USERNAME' を実際のユーザー名に置き換え"
echo "2. トピック（Topics）を追加: excel, gemini-api, ai, javascript, typo-checker"
echo "3. (オプション) GitHub Pagesを有効化"
