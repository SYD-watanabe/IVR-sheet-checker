# GitHubリポジトリ作成ガイド

このガイドに従って、GitHubに「IVR-sheet-checker」リポジトリを作成してください。

## 📋 手順

### 1. GitHubでリポジトリを作成

1. [GitHub](https://github.com) にログイン
2. 右上の「+」→「New repository」をクリック
3. 以下の設定を入力：
   - **Repository name**: `IVR-sheet-checker`
   - **Description**: `IVR設定シート誤字脱字チェッカー - AI（Gemini）を使用してExcel内のテキストを自動チェック`
   - **Public** を選択
   - ✅ **Add a README file** のチェックを外す（すでに用意済み）
   - ✅ **Add .gitignore** のチェックを外す（すでに用意済み）
   - **Choose a license**: MIT License を選択（または後で追加）
4. 「Create repository」をクリック

### 2. ローカルでGitリポジトリを初期化

#### 方法A: スクリプトを使用（推奨）

**Mac/Linux:**
```bash
chmod +x deploy-to-github.sh
./deploy-to-github.sh
```

**Windows:**
```cmd
deploy-to-github.bat
```

#### 方法B: 手動で実行

ターミナル/コマンドプロンプトを開いて、プロジェクトフォルダに移動：

```bash
# プロジェクトフォルダに移動
cd /path/to/IVR-sheet-checker

# Gitリポジトリを初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: IVR-sheet-checker v1.0.0"
```

### 3. GitHubリポジトリにプッシュ

**YOUR_USERNAME** を自分のGitHubユーザー名に置き換えてください：

```bash
# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/IVR-sheet-checker.git

# デフォルトブランチ名をmainに設定
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

### 4. GitHubリポジトリの設定

リポジトリページ（`https://github.com/YOUR_USERNAME/IVR-sheet-checker`）で以下を設定：

#### トピックの追加
「About」セクションの設定（歯車アイコン）をクリックして、以下のトピックを追加：
- `excel`
- `gemini-api`
- `ai`
- `javascript`
- `typo-checker`
- `ivr`
- `text-analysis`

#### GitHub Pagesの有効化（オプション）
1. Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `main` / `/ (root)`
4. Save

これで `https://YOUR_USERNAME.github.io/IVR-sheet-checker/` でアクセス可能になります。

### 5. README.mdの更新

README.md内の以下のプレースホルダーを実際の情報に置き換えてください：

```bash
# エディタでREADME.mdを開く
nano README.md  # またはお好みのエディタ

# 以下を置き換え：
YOUR_USERNAME → 実際のGitHubユーザー名
your_twitter → 実際のTwitterアカウント（なければ削除）
[Your Name] → 実際の名前
```

変更後、コミット＆プッシュ：

```bash
git add README.md
git commit -m "Update README with actual information"
git push
```

## 📦 含まれるファイル

```
IVR-sheet-checker/
├── index.html              # メインアプリケーション
├── js/
│   └── main.js            # JavaScriptコード（参考用）
├── README.md              # プロジェクト説明
├── LICENSE                # MITライセンス
├── .gitignore             # Git除外設定
├── GITHUB_SETUP.md        # このファイル
├── deploy-to-github.sh    # デプロイスクリプト（Mac/Linux）
└── deploy-to-github.bat   # デプロイスクリプト（Windows）
```

## 🎯 完了後の確認事項

✅ リポジトリが公開されている  
✅ README.mdが正しく表示されている  
✅ LICENSEファイルが含まれている  
✅ トピックが設定されている  
✅ （オプション）GitHub Pagesが有効化されている  

## 🚀 次のステップ

### リポジトリの宣伝
1. **README.mdにバッジを追加**（すでに含まれています）
2. **スクリーンショットを追加**
   ```bash
   mkdir images
   # スクリーンショットを images/ に配置
   git add images/
   git commit -m "Add screenshots"
   git push
   ```

3. **デモGIFの作成**（推奨）
   - 実際の使用例をGIFで録画
   - README.mdに追加

### コミュニティ機能の有効化
1. **Issues** - バグ報告や機能リクエスト用
2. **Discussions** - 質問や議論用
3. **Wiki** - 詳細なドキュメント用

## ❓ トラブルシューティング

### 認証エラーが発生する場合

**HTTPSの場合:**
```bash
# Personal Access Tokenを使用
# Settings → Developer settings → Personal access tokens
# 'repo' スコープを有効にしてトークンを生成
git remote set-url origin https://TOKEN@github.com/YOUR_USERNAME/IVR-sheet-checker.git
```

**SSHの場合:**
```bash
# SSH鍵を設定済みの場合
git remote set-url origin git@github.com:YOUR_USERNAME/IVR-sheet-checker.git
```

### プッシュが拒否される場合

```bash
# リモートの変更を取得
git pull origin main --allow-unrelated-histories

# 再度プッシュ
git push -u origin main
```

## 📞 サポート

問題が発生した場合：
1. [GitHub Docs](https://docs.github.com/) を確認
2. [GitHub Community](https://github.community/) で質問

---

**完了したら、このファイルは削除しても構いません。**

```bash
git rm GITHUB_SETUP.md
git commit -m "Remove setup guide"
git push
```
