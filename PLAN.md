# PLAN: クラウドデプロイ（本日 11:00 JST 会議前）

作成: 2026-09-18 08:10 JST / 期限: 10:40 JST（会議20分前に凍結）

## Step 0: Requirements Gap Analysis

| 分類 | 項目 | 扱い |
|---|---|---|
| CLEAR | Next.js 16 + Prisma 7 アプリを公開URLで動かし、会議でデモできる状態にする | 実施 |
| CLEAR | 現行機能（22画面）をそのまま。機能追加はしない | 実施 |
| ASSUMED | ホスティング = Vercel（唯一ログイン済みアカウント `blended-asia`）。契約主体はSTだが、アカウント移管は後日 | 進める |
| ASSUMED | DB = Neon Postgres（Vercel Marketplace）。Prisma 7 driver adapter + pooler URL | 進める |
| ASSUMED | デモ用データ = `seed.ts`（マスタ）+ `seed-dummy.ts`（直近60日分） | 進める |
| ASSUMED | admin 初期パスワードは生成した強いものに変更、会議後に社長へ共有 | 進める |
| VAGUE→決定 | 「最高の品質」= 本番で動く・安全な秘密情報・現実的なデータ・主要導線の実機確認。監査ログ/レート制限/健康管理記録は**スコープ外**（次フェーズ） | 明示 |
| MISSING | 独自ドメイン | 今回なし（vercel.app） |

## Stage 1: コードのクラウド対応（〜08:35）
- [x] WIP（Playwright）をコミット
- [x] `src/lib/prisma.ts`: pg Pool サイズ/timeout を serverless 向けに設定
- [x] `prisma/seed.ts`: admin パスワードを `ADMIN_INITIAL_PASSWORD` 環境変数から（未設定時は従来値、警告）
- [x] `vercel.json` buildCommand = `prisma generate && prisma migrate deploy && next build`（package.json ではなく vercel.json に）
- 受入: `npx tsc --noEmit` / `npm run test:run` / `npm run build` が通る

## Stage 2: プロビジョニング（〜09:00）
- [x] Vercel プロジェクト作成・link
- [x] Neon Postgres を Marketplace で provision → `DATABASE_URL`（pooled）
- [x] `JWT_SECRET`（64byte 生成）/ `ADMIN_INITIAL_PASSWORD` を production env に設定
- 受入: `vercel env ls` に3変数が存在

## Stage 3: デプロイ・投入・実機確認（〜09:50）
- [x] `vercel --prod` → migrate 成功
- [x] seed（マスタ）+ seed-dummy（60日分）を本番DBへ投入
- [x] ブラウザで確認: ログイン → ダッシュボードKPI/グラフ → 温度記録登録（異常値でアラート発生）→ ロット追跡 → ロスレポート → ログアウト → 未認証で /api 401
- 受入: 上記 golden path が本番URLで全て動く

## Stage 4: ドキュメント・記録（〜10:30）
- [x] `CLAUDE.md` / `docs/deploy.md` をクラウド手順に更新（オンプレ手順は「旧」として残す）
- [x] commit → push → PR（main へ）: https://github.com/Takeru-asia/Kawakamishokuhin/pull/1
- [x] Obsidian: `PJ_川上食品_HACCPMS/Status_現状把握_20260918.md`（現状・課題・本番URL・デモ手順）
- [x] Prep ブリーフに本番URL・ログイン情報を追記

## スコープ外（会議後に /plan）
監査ログ（訂正履歴）、ログインレート制限、健康管理記録、入庫出荷在庫、2/17要望3件、帳票PDF、独自ドメイン、Vercelアカウント移管（→ST）

## 実施ログ
- 08:20 `vercel env add` が値を空で保存する不具合 → REST API で再登録、admin ハッシュを DB で再設定、再デプロイ
- 08:25 `prisma/seed-lots.ts` 追加（ロット126件・紐付け252件）
- 09:40 本番E2E 2/2 PASS（初回失敗はテストのセレクタがヘッダーのログアウトボタンに一致していたため）
- 10:05 TZ修正（instrumentation.ts）を再デプロイ、PR #1 作成。gh は Takeru-asia に切替が必要だった

## Stage 5（追加 10:10）: フィードバック投稿機能
- [x] Prisma: `Feedback` モデル + enum（category / status）、migration `add_feedback`
- [x] `validations/feedback.ts` / `actions/feedback.ts`（create / list / updateStatus）
- [x] `/feedback` 1画面（投稿フォーム + 一覧。ADMIN/MANAGER は全件 + ステータス変更、WORKER は自分の分）
- [x] サイドバー「サポート > フィードバック」
- 受入: tsc / build / 本番で投稿→一覧表示（E2E追加は会議後）
