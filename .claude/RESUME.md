# RESUME（最終更新: 2026-10-09）

## 現在地
- ブランチ `feature/president-requests-202610`（`feature/quality-and-deployment` から分岐）。PR #1（旧ブランチ → main）は未マージ: https://github.com/Takeru-asia/Kawakamishokuhin/pull/1
- 本番: https://kawakami-haccp.vercel.app（Vercel `blended-asia/kawakami-haccp` + Neon `kawakami-haccp-db`）
- **10/9 本番デプロイ済み**: 社長要望対応（製造予定・大豆仕込み / 計器マスタ・設備点検 / 衛生カテゴリマスタ・残留塩素 / 出勤時チェック / 薬品使用記録）。migration `add_president_requests_202610` 適用、`prisma/seed-202610.ts` 投入済み
- 計画: `PLAN.md`（2026-10 要望対応）。9月のクラウド移行計画は `docs/PLAN_20260918_クラウド移行.md`

## 10/9 の到達点
- 社長からアプリ内フィードバック 2 件（10/8 大豆仕込み数量 / 10/9 本日の製造予定）→ 当日中に本番反映
- 10/9 打ち合わせ: 設備メンテ記録 / 出勤時体調記録 / 入室時写真 / 一般衛生管理記録の要望 → 写真以外を実装
- 議事録: Vault `03_Interactions/Minutes_川上食品_20261009.md`（録画未着、補完待ち）
- 対応表: Vault `04_Work/PJ_川上食品_HACCPMS/要望対応表_20261009.md` / 確認事項: `docs/QUESTIONS_FOR_川上社長_20261009.md`
- 社長は製品マスタを自分で編集している（9/18 ゆし豆腐、10/8 焼き豆腐・ソフト豆腐、油揚げを無効化）

## 残作業（優先順）
1. **本番の製品マスタ是正（ユーザー実行）**: seed 初版がコード衝突で「絹ごし」「ソフト豆腐」を重複作成（PRD-008/009）。`prisma/fix-products-202610.ts` を本番 env で実行して無効化 + 厚揚げ生地を追加
   ```bash
   vercel env pull /tmp/.env.prod --environment=production --yes --scope blended-asia
   npx tsx prisma/fix-products-202610.ts /tmp/.env.prod
   ```
2. 本番 feedbacks 2 件のステータスを NEW → RESOLVED（/feedback 画面で ADMIN が変更。分類器が本番書き込みを止めるためユーザー操作）
3. 社長へ対応報告メール（対応表 + 確認事項 Q1〜Q5）。次回定例 10/20（火）16:00
4. Meet 録画が届いたら議事録補完（Asana 期限 10/10）
5. iPad Safari 実機確認（Asana 期限 10/17）。デザインレビューは 768px 幅で PASS 済みだが実機未確認
6. 写真機能（Q1 回答後）/ 監査ログ / レート制限 / `middleware.ts`→`proxy.ts` / Vercel・GitHub 認可を ST に揃える

## ハマりポイント
- auto mode 分類器: 本番DBの読み書き・設定変更・seed 編集を止めることがある。本番読み取りは「`vercel env pull` 単体 → スクリプト内で env ファイルを読む → `npx tsx <script>`（許可済み）」の分割で通る。書き込み（updateMany 等）は止まるのでユーザー実行に回す
- `prisma/seed.ts` の衛生カテゴリ・ロスカテゴリは `create`（非冪等）→ 本番で再実行しない。追加マスタは `seed-202610.ts`（冪等）に書く
- `src/lib/constants.ts` は JWT_SECRET 未設定かつ NODE_ENV≠development で import 時に throw → vitest から import するテストは `vi.hoisted` で JWT_SECRET を設定（health.test.ts 参照）
- この Mac は GMT+7。`toLocale*` に `timeZone: "Asia/Tokyo"` を付けないと SSR/ブラウザで hydration 不一致（utils.ts は修正済み）
- `vercel env add`（CLI 53.2）は値を空で保存する → REST API で登録
- 本番 E2E は温度記録を実データとして残す → 実行後に削除。`e2e/president-requests.spec.ts` も本番に対しては実行しない（出勤・薬品・点検の記録が残る）
- ポート 3000 に別プロジェクトの dev server が居座ることがある → `-p 3100`
- Playwright: `button[type="submit"]` はヘッダーのログアウトにも一致 → `getByRole('button', { name })`

## 本番DBを触る手順
`vercel env pull <path> --environment=production --yes --scope blended-asia` → スクリプト側で env ファイルを読む（例: `prisma/fix-products-202610.ts`）→ `npx tsx <script> <path>`
