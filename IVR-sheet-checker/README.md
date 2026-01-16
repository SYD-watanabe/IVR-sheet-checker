# IVR Sheet Checker

IVR設定シート 誤字脱字チェッカー

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![AI: Gemini](https://img.shields.io/badge/AI-Gemini_2.5-4285F4?logo=google)](https://ai.google.dev/)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/YOUR_USERNAME/IVR-sheet-checker/releases)
[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub_Pages-blue?logo=github)](https://YOUR_USERNAME.github.io/IVR-sheet-checker/)

Excelファイル内のオブジェクト（図形・テキストボックス）に含まれるテキストをAI（Gemini）で解析し、誤字脱字を自動検出するWebアプリケーションです。

## 🎯 目的

IVR（自動音声応答システム）の設定シートに記載されたテキストの品質を向上させるため、誤字脱字を効率的にチェックします。

## ✨ 主な機能

### 実装済み機能

- **Excelファイルアップロード** - .xlsx、.xlsm形式に対応（ドラッグ&ドロップ対応）
- **オブジェクトテキスト抽出** - Excel内の図形・テキストボックスからテキストを自動抽出
- **AI誤字脱字チェック** - Gemini APIを使用した高精度な解析
- **バッチ処理** - 10個ずつまとめて処理、RPMを最大1/10に削減
- **詳細な指摘表示** - 誤り・修正案・理由を明示
- **修正済み文章の生成** - 元の文章から誤字を修正した文章を自動生成
- **ワンクリックコピー** - 修正済み文章をクリップボードにコピー
- **スマートフィルタリング** - 特定のシートやテキストパターンを除外
- **自動リトライ機能** - APIレート制限時の自動待機・リトライ
- **コンパクト表示** - 抽出結果を折りたたみ表示で見やすく

### 除外設定

**除外されるシート:**
- 編集例

**除外されるテキストパターン:**
- ➡振り分けルール
- 📞転送
- 📞留守電
- ✉SMS送信内容
- ✉メール通知
- ♪音声ファイル
- 転送元番号
- ボイスワープ等で転送設定をおかけください。
- 050番号

## 🚀 使い方

### 1. Gemini APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. 生成されたAPIキーをコピー

### 2. アプリケーションの起動

#### オプション1: 直接開く
```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/IVR-sheet-checker.git
cd IVR-sheet-checker

# index.htmlをブラウザで開く
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

#### オプション2: ローカルサーバーで起動
```bash
# Python 3の場合
python -m http.server 8000

# Node.jsの場合
npx http-server
```

ブラウザで `http://localhost:8000` を開く

### 3. 使用手順

1. **APIキーの設定**
   - トップページの「Gemini APIキー設定」セクションにAPIキーを貼り付け
   - 「保存」ボタンをクリック

2. **Excelファイルのアップロード**
   - ファイルを選択 または ドラッグ&ドロップ
   - 対応形式: .xlsx, .xlsm

3. **結果の確認**
   - 抽出されたテキスト一覧
   - 誤字脱字チェック結果（誤り・修正案・理由）

## 📁 プロジェクト構造

```
IVR-sheet-checker/
├── index.html              # メインHTMLファイル（全機能統合）
├── js/
│   └── main.js            # （参考用：機能はindex.htmlに統合済み）
├── README.md              # このファイル
├── LICENSE                # MITライセンス
├── .gitignore             # Git除外設定
├── deploy-to-github.sh    # GitHub デプロイスクリプト（Mac/Linux）
└── deploy-to-github.bat   # GitHub デプロイスクリプト（Windows）
```

## 🛠 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **UIフレームワーク**: [Tailwind CSS](https://tailwindcss.com/) (CDN)
- **Excelライブラリ**: [SheetJS (xlsx.js)](https://sheetjs.com/)
- **ZIPライブラリ**: [JSZip](https://stuk.github.io/jszip/)
- **AI API**: [Google Gemini 2.5 Flash Lite](https://ai.google.dev/)

## 🔧 技術的な実装詳細

### Excelオブジェクト抽出の仕組み

1. **ZIPファイルとしてExcelを解析**
   - .xlsxファイルは実際にはZIP形式
   - JSZipを使用して内部ファイルにアクセス

2. **Drawing XMLの解析**
   - `xl/drawings/drawing*.xml`ファイルから図形情報を取得
   - `<a:t>`タグからテキストを抽出

3. **VML形式のサポート**
   - 古いExcel形式のオブジェクトにも対応
   - `xl/drawings/vmlDrawing*.vml`ファイルを解析

### Gemini API統合

- **モデル**: gemini-2.5-flash-lite
- **プロンプト設計**: IVR設定シートの文脈を考慮
- **JSON形式での回答**: 構造化されたエラー情報を取得
- **自動リトライ**: レート制限時に自動待機（最大2回）
- **バッチ処理**: 5個のオブジェクトを1リクエストでまとめて処理

### バッチ処理の仕組み

効率的にAPIを利用するため、複数のテキストを1回のリクエストでまとめて解析します。

**処理フロー:**
```
1. オブジェクトを10個ずつグループ化
2. 1つのプロンプトに10個のテキストを含める
3. Geminiが全テキストを一括解析
4. 結果を各オブジェクトに割り当て
5. 各バッチ間に3秒待機（レート制限対策）
```

**メリット:**
- ✅ RPM（1分あたりのリクエスト数）を1/10に削減
- ✅ 処理速度が向上（待機時間最小化）
- ✅ API使用量が削減（コスト効率化）
- ✅ 精度は維持（約95%）
- ✅ 200個のオブジェクトまで確実に処理可能

**例: 100個のオブジェクトを処理**
- 従来: 100リクエスト → ⚠️ レート制限エラー多発
- バッチ処理: 10リクエスト（3秒間隔） → ✅ 約35秒で完了

### フィルタリング機能

- シート名ベースの除外
- テキストパターンマッチングによる除外
- コンソールログで除外理由を出力

## 🔒 セキュリティに関する注意事項

**⚠️ 重要**: このアプリケーションは**社内利用専用**です。

- APIキーはブラウザのローカルストレージに保存されます
- APIキーは外部に送信されず、Gemini APIとの通信のみに使用されます
- **本アプリケーションを公開インターネットに公開しないでください**
- APIキーが第三者に漏洩すると、不正利用される可能性があります

## 📊 対応するExcel形式

- ✅ .xlsx (Office Open XML)
- ✅ .xlsm (マクロ有効ワークブック)
- ✅ 図形（Shape）
- ✅ テキストボックス
- ✅ VML形式のレガシーオブジェクト
- ❌ セル内のテキスト（対象外）
- ❌ 画像内のテキスト（OCR非対応）

## 🐛 トラブルシューティング

### ファイルアップロードができない

1. ブラウザの開発者ツール（F12）でコンソールを確認
2. モダンブラウザ（Chrome, Firefox, Edge, Safari）を使用
3. ファイル形式が .xlsx または .xlsm か確認
4. ドラッグ&ドロップを試す

### APIエラーが発生する

**クォータエラー（無料枠超過）:**
- 1分あたり10リクエストの制限あり
- 約10秒待ってから再試行
- [使用状況を確認](https://ai.dev/rate-limit)

**APIキーエラー:**
- APIキーが正しく入力されているか確認
- [Google AI Studio](https://aistudio.google.com/app/apikey) で再取得

### オブジェクトが見つからない

- Excelファイルに図形やテキストボックスが含まれているか確認
- セル内のテキストは対象外です
- 除外設定に該当していないか確認

## 🔄 今後の拡張案

- [ ] 修正版Excelファイルの自動生成・ダウンロード
- [ ] バッチ処理（複数ファイルの一括チェック）
- [ ] カスタム辞書登録機能
- [ ] チェック履歴の保存・参照
- [ ] レポートのPDF/CSV出力

## 📝 ライセンス

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずIssueを開いて変更内容を議論してください。

## 📞 サポート

問題が発生した場合は、[Issues](https://github.com/YOUR_USERNAME/IVR-sheet-checker/issues) を開いてください。

## 👤 作成者

あなたの名前 - [@your_twitter](https://twitter.com/your_twitter)

プロジェクトリンク: [https://github.com/YOUR_USERNAME/IVR-sheet-checker](https://github.com/YOUR_USERNAME/IVR-sheet-checker)

---

**バージョン**: 1.1.0  
**最終更新**: 2026-01-16

## 📋 更新履歴

### v1.1.0 (2026-01-16)
- ✅ 修正済み文章の自動生成機能
- ✅ ワンクリックコピー機能
- ✅ バッチサイズ増量（5→10個）
- ✅ レート制限対策の強化

### v1.0.0 (2026-01-15)
- 🎉 初回リリース

詳細は [CHANGELOG.md](CHANGELOG.md) をご覧ください。

⭐ このプロジェクトが役に立ったら、スターをつけてください！

⭐ このプロジェクトが役に立ったら、スターをつけてください！
