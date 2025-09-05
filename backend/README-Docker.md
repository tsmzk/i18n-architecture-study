# 🐳 Docker MySQL セットアップガイド

検証用の簡単なMySQL Dockerコンテナ設定です。

## 🚀 クイックスタート

```bash
# MySQL起動
docker-compose up -d mysql

# 起動確認（約30秒待機）
docker-compose ps

# データベースは手動でPrismaマイグレーションを実行
# (各パターン毎に実行)
npm run db:generate:pattern1
npm run db:migrate:pattern1 -- --name init
npm run db:seed:pattern1
```

## 📋 設定内容

### コンテナ仕様
- **Image**: MySQL 8.0
- **Container Name**: i18n-mysql
- **Port**: 3306 → 3306
- **Authentication**: mysql_native_password

### 作成されるデータベース
- `i18n_pattern1` - Pattern 1: 専用翻訳テーブル
- `i18n_pattern2` - Pattern 2: 統一翻訳テーブル  
- `i18n_pattern3` - Pattern 3: JSONカラム管理

### 認証情報
- **Root Password**: password
- **Application User**: prisma
- **Application Password**: prisma123

## 🔧 管理コマンド

```bash
# コンテナ起動
docker-compose up -d mysql

# コンテナ停止
docker-compose stop mysql

# コンテナ削除（データも削除）
docker-compose down -v

# ログ確認
docker-compose logs mysql

# MySQL接続
docker-compose exec mysql mysql -u prisma -pprisma123

# データベース一覧表示
docker-compose exec mysql mysql -u prisma -pprisma123 -e "SHOW DATABASES;"

# 特定データベース確認
docker-compose exec mysql mysql -u prisma -pprisma123 i18n_pattern1 -e "SHOW TABLES;"
```

## 🗂️ ファイル構成

```
backend/
├── docker-compose.yml           # Docker Compose設定
├── prisma/
│   ├── schema/                  # 3つの翻訳パターン用スキーマ
│   │   ├── pattern1.prisma      # メイン + 専用Translationテーブル
│   │   ├── pattern2.prisma      # 統一Translationテーブル  
│   │   └── pattern3.prisma      # JSONカラム管理
│   └── seeds/                   # シードファイル
└── .env                         # データベース接続設定
```

## ⚠️ 注意事項

- **検証用設定**: 本番環境での使用は非推奨
- **データ永続化**: `mysql_data` ボリュームに保存
- **セキュリティ**: 簡単な認証設定（検証用）
- **ポート競合**: ローカルMySQLと同じポート3306を使用

## 🔄 切り替え方法

### Docker → ローカルMySQL
```bash
# Dockerコンテナ停止
docker-compose stop mysql

# .envファイルでローカル設定をアンコメント
```

### ローカルMySQL → Docker  
```bash
# ローカルMySQL停止
brew services stop mysql

# Dockerコンテナ起動
docker-compose up -d mysql
```