# 多言語対応Webシステム検証プロジェクト

React + Vite（フロントエンド）とNode.js + Express（バックエンド）を使用した多言語対応システムの実装検証プロジェクトです。3つの異なる翻訳管理パターンの比較検証を行います。

## 🌐 対応言語

- **日本語（ja）** - デフォルト言語
- **英語（en）** - English
- **中国語簡体字（zh-cn）** - 简体中文
- **中国語繁体字（zh-tw）** - 繁體中文
- **韓国語（ko）** - 한국어

## 📁 プロジェクト構成

```
i18n-architecture-study/
├── frontend/                    # React + Vite フロントエンド
│   ├── src/
│   │   ├── components/         # UIコンポーネント
│   │   ├── hooks/              # カスタムフック
│   │   ├── i18n/               # 国際化設定
│   │   └── types/              # TypeScript型定義
│   └── public/locales/         # 翻訳ファイル (JSON)
│
├── backend/                     # Node.js + Express バックエンド
│   ├── src/
│   │   ├── controllers/        # APIコントローラー
│   │   ├── services/           # ビジネスロジック
│   │   ├── repositories/       # データアクセス層
│   │   │   ├── pattern1/       # 専用Translationテーブル
│   │   │   ├── pattern2/       # 統一Translationテーブル
│   │   │   └── pattern3/       # JSONカラム管理
│   │   ├── middleware/         # ミドルウェア
│   │   └── config/             # 設定ファイル
│   └── prisma/
│       ├── schema/             # 3パターンのPrismaスキーマ
│       └── seeds/              # シードデータ生成
│
└── docs/                       # ドキュメント
```

## 🔧 翻訳管理の3パターン

### Pattern 1: メイン + 専用Translationテーブル
- **特徴**: 各エンティティに対応する専用の翻訳テーブルを作成
- **利点**: 型安全性が高く、JOIN操作が効率的
- **欠点**: テーブル数が多くなる
- **使用例**: `ArticleTranslation`, `CategoryTranslation`

### Pattern 2: 統一Translationテーブル
- **特徴**: 1つの翻訳テーブルですべてのエンティティの翻訳を管理
- **利点**: テーブル数を抑制でき、新しいエンティティの追加が容易
- **欠点**: 複雑なクエリが必要、型安全性が劣る
- **使用例**: `Translation` テーブルに `entityType`, `entityId`, `fieldName` で管理

### Pattern 3: JSONカラム管理
- **特徴**: 各テーブルにJSONカラムを追加して翻訳データを格納
- **利点**: シンプルな構造、JOIN不要
- **欠点**: データベースレベルでの検索・ソートが困難
- **使用例**: `titleTranslations: {"en": "Title", "zh-cn": "标题"}`

## 🚀 セットアップ手順

### 前提条件

- **Node.js** 18以上
- **npm** または **yarn**
- **MySQL** 8.0以上（Prisma使用時）

### 1. 依存関係のインストール

プロジェクトのセットアップは自動化されています：

```bash
# フロントエンドの自動セットアップ
./setup-frontend.sh

# バックエンドの自動セットアップ
./setup-backend.sh
```

### 2. データベースの準備

環境変数を設定（`.env`ファイルは既に用意済み）：

```bash
# 使用する翻訳パターンを選択
export TRANSLATION_PATTERN=pattern1  # pattern1, pattern2, pattern3

# データベースURL（3つのパターン用に分離）
DATABASE_URL_PATTERN1="mysql://root:password@localhost:3306/i18n_pattern1"
DATABASE_URL_PATTERN2="mysql://root:password@localhost:3306/i18n_pattern2"
DATABASE_URL_PATTERN3="mysql://root:password@localhost:3306/i18n_pattern3"
```

### 3. データベースマイグレーションとシードデータ

```bash
cd backend

# Prismaクライアントの生成
npm run prisma:generate

# データベースのマイグレーション実行
npm run prisma:migrate

# サンプルデータの投入
npm run prisma:seed
```

**シードデータのオプション：**
```bash
# 小規模データセット（テスト用）
npm run prisma:seed test

# 中規模データセット（開発用）
npm run prisma:seed medium

# 大規模データセット（パフォーマンステスト用）
npm run prisma:seed benchmark
```

## 🏃‍♂️ 起動方法

### 方法1: 同時起動（推奨）

```bash
# プロジェクトルートで実行
./start-project.sh
```

### 方法2: 個別起動

```bash
# バックエンド
cd backend
npm run dev    # http://localhost:3001

# フロントエンド（別ターミナル）
cd frontend
npm run dev    # http://localhost:5173
```

## 🌐 API エンドポイント

### システム情報
- `GET /health` - ヘルスチェック
- `GET /api/system` - 翻訳パターン情報

### 記事API
- `GET /api/articles` - 記事一覧取得
- `GET /api/articles/:id` - 記事詳細取得
- `GET /api/articles/slug/:slug` - スラッグによる記事取得
- `GET /api/articles/popular` - 人気記事取得
- `GET /api/articles/search?q=query` - 記事検索
- `POST /api/articles` - 記事作成
- `PUT /api/articles/:id` - 記事更新
- `DELETE /api/articles/:id` - 記事削除

### 言語パラメータの指定方法

1. **クエリパラメータ**
   ```
   GET /api/articles?locale=en
   ```

2. **Accept-Languageヘッダー**
   ```
   Accept-Language: zh-cn
   ```

3. **デフォルト言語**: 日本語（ja）

### API使用例

```bash
# 英語で記事一覧を取得
curl "http://localhost:3001/api/articles?locale=en"

# 中国語（簡体字）で特定記事を取得
curl "http://localhost:3001/api/articles/1?locale=zh-cn"

# 記事を検索（韓国語）
curl "http://localhost:3001/api/articles/search?q=technology&locale=ko"
```

## 🎯 機能確認・動作テスト

### フロントエンド機能

1. **言語切り替え**: 右上のドロップダウンから言語を選択
2. **翻訳確認**: UIの各要素が選択した言語で表示
3. **数値・日付フォーマット**: 各言語に応じたローカライゼーション
4. **通貨表示**: 日本円での価格表示

### バックエンドAPI

```bash
# ヘルスチェック
curl http://localhost:3001/health

# 記事一覧（日本語）
curl http://localhost:3001/api/articles

# 記事一覧（英語）
curl "http://localhost:3001/api/articles?locale=en"

# システム情報確認
curl http://localhost:3001/api/system
```

## ⚡ パフォーマンステスト

### 翻訳パターンの切り替え

```bash
# Pattern 1に切り替え
export TRANSLATION_PATTERN=pattern1
npm run dev

# Pattern 2に切り替え
export TRANSLATION_PATTERN=pattern2
npm run dev

# Pattern 3に切り替え
export TRANSLATION_PATTERN=pattern3
npm run dev
```

### ベンチマークデータの生成

```bash
# 大量データを生成（10,000記事 + 翻訳）
cd backend
npm run prisma:seed benchmark
```

### パフォーマンス比較の実行

各パターンでの処理速度を比較：

1. **データベース操作速度**
2. **翻訳データ取得速度**
3. **メモリ使用量**
4. **ストレージ使用量**

## 🛠 開発時の注意事項

### 翻訳ファイル管理
- 新しい翻訳キー追加時は全言語ファイルを同期
- TypeScript型定義ファイルも併せて更新

### データベーススキーマ変更
- パターンごとに異なるマイグレーションファイルが必要
- 環境変数`TRANSLATION_PATTERN`で使用パターンを制御

### エラーハンドリング
- 翻訳が存在しない場合は日本語にフォールバック
- APIエラーレスポンスにはlocale情報を含める

## 📊 技術仕様

### フロントエンド
- **React** 18 + **TypeScript**
- **Vite** （ビルドツール）
- **i18next** / **react-i18next** （国際化）
- **i18next-browser-languagedetector** （言語自動検出）
- **i18next-http-backend** （翻訳ファイル読み込み）

### バックエンド
- **Node.js** + **Express** + **TypeScript**
- **Prisma** ORM（マルチスキーマ対応）
- **MySQL** 8.0+
- **@faker-js/faker** （テストデータ生成）

## 🔍 トラブルシューティング

### ポートが使用中の場合
```bash
# プロセス確認と終了
lsof -i :5173  # フロントエンド
lsof -i :3001  # バックエンド
kill -9 [PID]
```

### データベース接続エラー
```bash
# 接続設定確認
mysql -u root -p
CREATE DATABASE i18n_pattern1;
CREATE DATABASE i18n_pattern2;
CREATE DATABASE i18n_pattern3;
```

### Prismaクライアント生成エラー
```bash
cd backend
npx prisma generate --schema=prisma/schema/pattern1.prisma
npx prisma generate --schema=prisma/schema/pattern2.prisma
npx prisma generate --schema=prisma/schema/pattern3.prisma
```

### 依存関係の再インストール
```bash
# フロントエンド
cd frontend && rm -rf node_modules package-lock.json && npm install

# バックエンド
cd backend && rm -rf node_modules package-lock.json && npm install
```

## 🎓 学習・検証ポイント

### 1. 翻訳管理手法の比較
- 各パターンの性能特性を理解
- スケーラビリティの違いを検証
- 開発・保守性の評価

### 2. 国際化ベストプラクティス
- フォールバック戦略の実装
- 日付・数値フォーマットの対応
- RTL言語対応の準備

### 3. API設計
- RESTful APIでの多言語対応
- エラーハンドリングの国際化対応
- パフォーマンス最適化

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

Issues や Pull Requests をお気軽にお送りください。

---

**🚀 プロジェクト起動**: `./start-project.sh`  
**📍 フロントエンド**: http://localhost:5173  
**🔧 バックエンドAPI**: http://localhost:3001  
**💾 ヘルスチェック**: http://localhost:3001/health