# RESUME（最終更新: 2026-09-21）

## 現在地
- ブランチ `feature/quality-and-deployment`（origin と同期済み）。PR #1 → main 未マージ: https://github.com/Takeru-asia/Kawakamishokuhin/pull/1
- 本番: https://kawakami-haccp.vercel.app（Vercel `blended-asia/kawakami-haccp` + Neon `kawakami-haccp-db`）
- **未デプロイ**: `7d42a2b feat: track user last login time`（`User.lastLoginAt` + migration）。反映は `vercel --prod --yes` をユーザーが実行（分類器が Claude の deploy/PR/push を止めることがある。`gh` は `Takeru-asia` に switch 済みか確認）

## 9/18 の到達点
- オンプレ（Windows Server + VPN）→ クラウド移行、本番稼働、E2E golden path 2/2 PASS
- アプリ内フィードバック機能（/feedback、種類・画面プルダウン、ADMIN/MANAGER はステータス更新）
- 川上社長と再始動合意。定例 **第1・第3火 16:00–16:30 JST**（初回 10/6、Meet `sug-xfwi-unt`）、社長を招待済み
- 社長用 ADMIN アカウント `kawakamitohu@gmail.com` を本番に作成、ログイン案内メール送付済み（9/18）
- 議事録: Vault `03_Interactions/Minutes_川上食品_20260918.md` / 現状把握: `04_Work/PJ_川上食品_HACCPMS/Status_現状把握_20260918.md`
- delivery-ontology: PROP-006 起案済み（提案画面で承認・適用が未実施）

## 次にやること（Asana と同期済み）
1. `vercel --prod --yes` で lastLoginAt を本番反映（ユーザー実行）
2. 社長の利用状況確認: `/feedback` の件数 + `users.last_login_at`（9月末で反応なしならリマインド）
3. iPad Safari 実機確認と崩れ修正（Asana 期限 10/2）
4. 定例#1 議題準備: フィードバック対応表 + 生産管理系の優先機能の選択肢（10/5）
5. 会議後の /plan 候補: 監査ログ（訂正履歴）/ ログインのレート制限 / `middleware.ts`→`proxy.ts` / 依存更新 / 既存 lint エラー3件 / Vercel・GitHub 認可を ST（Takeru-asia）へ揃える / Neon バックアップと3年保存

## ハマりポイント
- `vercel env add`（CLI 53.2）は値を空で保存する → REST API `POST /v10/projects/{id}/env?upsert=true` で登録し `vercel env pull` で長さ検証（CLAUDE.md 参照）
- Vercel は UTC 実行かつ `TZ` は予約変数 → `src/instrumentation.ts` で `process.env.TZ=Asia/Tokyo`
- 本番 E2E は温度記録（9.5℃, notes「E2E 本番検証（異常値）」）を実データとして残す → 実行後に削除
- ポート 3000 に別プロジェクト（HAN'S）の dev server が居座ることがある → ローカル検証は `-p 3100`
- 再デプロイ直後、開きっぱなしのタブは Server Action ID が古くて「ログイン中…」で止まる → ハードリロード
- Playwright で `button[type="submit"]` はヘッダーのログアウトフォームにも一致する → `getByRole('button', { name })` を使う

## 本番DBを触る手順
`vercel env pull <path> --environment=production --yes` → `set -a; source <path>; set +a` → `npx tsx prisma/seed*.ts` / 任意の tsx スクリプト（CLAUDE.md「Production（Vercel + Neon）」参照）
