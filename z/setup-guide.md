# Todo Bingo セットアップガイド

## 1. Supabase プロジェクト作成

### Step 1: Supabaseにサインアップ/ログイン
1. https://supabase.com にアクセス
2. GitHubアカウントでサインイン

### Step 2: 新規プロジェクト作成
1. ダッシュボードで「New Project」をクリック
2. 以下を入力:
   - **Name**: `todo-bingo` （任意）
   - **Database Password**: 安全なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
3. 「Create new project」をクリック
4. プロジェクト作成完了まで数分待つ

### Step 3: API KeysをメモStep
プロジェクトダッシュボードで:
1. 左サイドバー「Project Settings」→「API」
2. 以下の値をコピー:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

---

## 2. データベース設定

### Step 1: SQLエディタでマイグレーション実行
1. 左サイドバー「SQL Editor」をクリック
2. 「New Query」をクリック
3. `supabase/migrations/001_initial_schema.sql` の内容をコピー＆ペースト
4. 「Run」をクリック

### Step 2: 認証設定
1. 左サイドバー「Authentication」→「Providers」
2. 必要なプロバイダーを有効化:
   - **Email**: デフォルトで有効
   - **Google**: (オプション) Client ID/Secretを設定
   - **GitHub**: (オプション) Client ID/Secretを設定

### Step 3: サイトURL設定
1. 「Authentication」→「URL Configuration」
2. Site URL: デプロイ後のURL（例: `https://todo-bingo.vercel.app`）
3. Redirect URLs:
   - `http://localhost:3000/**`
   - `https://todo-bingo.vercel.app/**`

---

## 3. ローカル環境設定

### Step 1: 環境変数ファイル作成
```bash
cp .env.local.example .env.local
```

### Step 2: 値を設定
`.env.local` を編集:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### Step 3: 動作確認
```bash
pnpm dev
```

---

## 4. Vercel デプロイ

### Step 1: GitHubリポジトリ作成
```bash
gh repo create todo-bingo --public --source=. --push
```

### Step 2: Vercelにログイン
https://vercel.com でGitHubアカウントでログイン

### Step 3: プロジェクトインポート
1. ダッシュボードで「Add New」→「Project」
2. GitHubリポジトリ `todo-bingo` を選択
3. 「Import」をクリック

### Step 4: 環境変数設定
「Environment Variables」セクションで追加:
| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

### Step 5: デプロイ
「Deploy」をクリック

---

## 5. デプロイ後の設定

### Supabase側
1. 「Authentication」→「URL Configuration」
2. Site URL: `https://your-app.vercel.app`
3. Redirect URLs に追加: `https://your-app.vercel.app/**`

---

## トラブルシューティング

### 「Invalid API Key」エラー
- 環境変数が正しく設定されているか確認
- Vercelで環境変数を追加後、再デプロイが必要

### 認証が動作しない
- Supabase の URL Configuration を確認
- Redirect URLs にデプロイ先URLが含まれているか確認

### データが保存されない
- RLS (Row Level Security) ポリシーが正しく設定されているか確認
- SQLマイグレーションが正常に実行されたか確認
