# Todo Bingo - 目標達成ビンゴゲーム 機能仕様書

## 概要

今年達成したい目標をビンゴカードに配置し、達成するごとにマスを開けていくゲーミフィケーションアプリ。

---

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth |
| デプロイ | Vercel |

---

## コア機能

### 1. ビンゴカード

- **任意のNxNサイズ**: デフォルト5x5、3x3〜9x9まで選択可能
- **入力モード**: 各マスに目標テキストを入力
- **達成モード**: 目標達成時にマスをタップして開ける
- **センターフリーマス**: オプションで中央をフリーマスに設定可能

### 2. モード切り替え

| モード | 説明 |
|--------|------|
| 編集モード | 目標の入力・編集が可能 |
| プレイモード | 達成チェック専用、誤タップ防止 |

### 3. 進捗表示

- **プログレスバー**: 達成マス数 / 総マス数（パーセント表示）
- **ビンゴライン数**: 現在のビンゴ達成数
- **残りマス数**: 次のビンゴまであと何マスか

---

## ゲーミフィケーション機能

### 4. ポイント＆レベルシステム

| アクション | ポイント |
|-----------|---------|
| マス達成 | 100pt |
| ビンゴ達成 | 500pt |
| 連続日ボーナス | ×1.1〜×2.0 |

- 累計ポイントでレベルアップ
- レベルに応じた称号付与

### 5. バッジ・実績

| バッジ | 条件 |
|--------|------|
| First Step | 最初の1マス達成 |
| First Bingo | 初ビンゴ達成 |
| Triple Line | 3ライン同時達成 |
| Blackout | 全マス達成 |
| Week Streak | 7日連続達成 |
| Month Streak | 30日連続達成 |
| Customizer | テーマをカスタマイズ |
| Social Butterfly | 5人にシェア |

### 6. ストリーク（連続記録）

- **デイリーストリーク**: 連続で何かを達成した日数
- **ウィークリーチャレンジ**: 週ごとのミニ目標
- **カレンダー表示**: 達成日をヒートマップで可視化

### 7. ランダム要素

- **ラッキースター**: ランダムで1マスに★が付き、ポイント2倍
- **ミステリーボーナス**: 特定の順序で達成するとシークレット報酬
- **季節イベント**: 正月・GW・年末に特別ボーナス

---

## ソーシャル機能

### 8. シェア機能

- **SNSシェア**: Twitter/X、LINE、Instagramストーリー
- **画像生成**: ビンゴカードをOGP画像として自動生成
- **進捗シェア**: テンプレート投稿
- **匿名シェア**: 目標内容を隠してシェア可能

### 9. フレンド機能

- **フレンド追加**: ユーザーID or QRコード
- **進捗閲覧**: フレンドの達成状況確認
- **応援機能**: 拍手ボタンで応援
- **コメント**: マス達成時にコメント

### 10. ランキング

- **グローバル**: 全ユーザーのポイント順位
- **フレンド内**: フレンド間での順位
- **期間別**: 週間/月間/年間
- **カテゴリ別**: 健康・学習・趣味など

### 11. チームビンゴ（将来拡張）

- グループで同じビンゴカードに挑戦
- 誰が何を達成したか可視化
- チーム対抗戦

---

## 分析・振り返り機能

### 12. ダッシュボード

- **達成率グラフ**: 日/週/月単位の推移
- **カテゴリ分析**: 目標の傾向分析
- **達成日数**: 平均達成日数
- **曜日別分析**: どの曜日に達成が多いか

### 13. 年間レポート

- **年末まとめ**: 1年間の達成を振り返り
- **ハイライト**: 最も印象的な達成
- **統計サマリー**: 総達成数、ビンゴ数、ポイント
- **来年への提案**: 傾向から次年度の目標提案

### 14. AI目標提案（将来拡張）

- 過去の達成傾向から目標を提案
- カテゴリバランスの提案
- 難易度調整の提案

---

## UI/UX機能

### 15. アニメーション

| イベント | エフェクト |
|----------|-----------|
| マス開封 | スクラッチ風 or フリップ |
| ビンゴ達成 | 紙吹雪＆効果音 |
| レベルアップ | 派手なエフェクト |
| バッジ獲得 | ポップアップ通知 |

### 16. カスタマイズ

- **テーマ**: 10種類以上のカラーテーマ
- **背景**: グラデーション、パターン、画像
- **マスの形**: 丸、四角、六角形
- **フォント**: 複数のフォントから選択

### 17. アクセシビリティ

- **ダークモード**: 目に優しい暗色テーマ
- **文字サイズ調整**: 小/中/大
- **ハイコントラスト**: 視認性向上モード

### 18. レスポンシブ

- **モバイルファースト**: スマホで快適操作
- **タブレット対応**: iPad等で大画面表示
- **PWA対応**: ホーム画面に追加可能

---

## データモデル

### users テーブル

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### bingo_cards テーブル

```sql
CREATE TABLE bingo_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  size INTEGER NOT NULL CHECK (size >= 3 AND size <= 9),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### bingo_cells テーブル

```sql
CREATE TABLE bingo_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES bingo_cards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 0 AND position <= 80),
  goal_text TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  category TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  UNIQUE (card_id, position)
);
```

### achievements テーブル

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);
```

### friendships テーブル

```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, friend_id)
);
```

---

## 画面一覧

| パス | 画面名 | 説明 |
|------|--------|------|
| `/` | ホーム | ログイン/登録ボタン |
| `/auth/login` | ログイン | メール/SNSログイン |
| `/auth/signup` | 登録 | 新規アカウント作成 |
| `/dashboard` | ダッシュボード | メイン画面、カード一覧 |
| `/bingo/new` | 新規作成 | ビンゴカード作成 |
| `/bingo/[id]` | ビンゴ詳細 | カード表示・操作 |
| `/bingo/[id]/edit` | 編集 | 目標編集モード |
| `/friends` | フレンド | フレンド一覧・管理 |
| `/ranking` | ランキング | 順位表示 |
| `/settings` | 設定 | テーマ・プロフィール設定 |
| `/analytics` | 分析 | ダッシュボード |

---

## 実装フェーズ

### Phase 1: MVP

1. Next.js プロジェクトセットアップ
2. Supabase 接続＆認証
3. ビンゴカード表示（5x5固定）
4. 入力モード実装
5. 達成モード実装
6. プログレスバー

### Phase 2: コア機能

1. 任意サイズ対応（3x3〜9x9）
2. ポイントシステム
3. レベル＆称号
4. 基本バッジ5種類
5. ストリーク機能

### Phase 3: ソーシャル

1. SNSシェア機能
2. OGP画像生成
3. フレンド機能
4. 応援＆コメント
5. ランキング

### Phase 4: 分析

1. ダッシュボード
2. グラフ表示
3. カテゴリ分析
4. 年間レポート

### Phase 5: ポリッシュ

1. アニメーション追加
2. テーマカスタマイズ
3. PWA対応
4. パフォーマンス最適化

---

## ディレクトリ構造

```
todo-bingo/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── bingo/
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── friends/page.tsx
│   │   ├── ranking/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── bingo/
│   │   │   ├── BingoCard.tsx
│   │   │   ├── BingoCell.tsx
│   │   │   └── BingoStatus.tsx
│   │   ├── gamification/
│   │   │   ├── PointsDisplay.tsx
│   │   │   ├── LevelBadge.tsx
│   │   │   ├── AchievementPopup.tsx
│   │   │   └── StreakCounter.tsx
│   │   └── social/
│   │       ├── ShareButton.tsx
│   │       ├── FriendList.tsx
│   │       └── Ranking.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── utils/
│   │   │   ├── bingo.ts
│   │   │   └── points.ts
│   │   └── constants/
│   │       ├── badges.ts
│   │       └── themes.ts
│   ├── hooks/
│   │   ├── useBingoCard.ts
│   │   ├── useAuth.ts
│   │   └── usePoints.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── public/
│   └── icons/
├── supabase/
│   └── migrations/
└── z/
    └── feature-spec.md
```

---

## 作成日

2025年1月1日
