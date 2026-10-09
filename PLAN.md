# PLAN: 川上社長 要望対応（2026-10-09）

作成: 2026-10-09 / ブランチ `feature/president-requests-202610`
出典: 本番 feedbacks 2件（10/8・10/9）/ Vault `03_Interactions/Minutes_川上食品_20261009.md` / `Minutes_川上食品_20260217.md`

## Step 0: Feedback 評価（/feedback Phase 1）

| # | 指摘 | 前提 | 検証結果 | 判定 |
|---|---|---|---|---|
| 1 | 大豆の仕込み数量をダッシュボードに（一般 / コープロ / 絹ごし用） | 数量は人が入力（レシピから自動算出ではない） | レシピ表 `ProductMaterial` は空。原材料マスタの大豆は1種（国産）のみ → 3種を追加し、製造予定と一緒に前日入力 | SOUND（ASSUMED: 単位 kg、入力者は ADMIN/MANAGER） |
| 2 | 「本日の製造予定」をダッシュボードに。前日設定→当日反映。8品目 | 日付ごとの予定テーブルがある | `ProductionTarget` は月次のみ → 新モデル `ProductionPlan` が必要。製品マスタは4品目で社長の8品目と不一致 | RISKY（製品の重複: 既存「絹ごし豆腐/木綿豆腐」と「絹ごし/もめん」。→ 8品目を新規追加し旧4品目は残す。統合は社長に確認） |
| 3 | 設備メンテナンス登録（温度計校正 月1 / スケール 毎日） | 計器マスタがある | `Facility` は貯蔵設備（温度基準）専用。計器マスタなし → 新モデル `Equipment` + `EquipmentCheck` | SOUND（ASSUMED: 点検周期は DAILY/MONTHLY の2種、結果は PASS/FAIL） |
| 4 | 出勤時の体調記録（出勤時間 / 体温 / 手指の傷 / 家族の病気） | 従業員 = `User`。RD 2.1.3 と整合 | 既存モデルなし。RD 2.1.3（体温・体調・手指・異常アラート）に社長の2項目を加える。RD 2.1.4 の服装確認（帽子/マスク/作業着）も同じ出勤時に行うので1画面に統合 | SOUND（ASSUMED: 本人または責任者が代理入力。異常判定 = 体温 ≥ 37.5℃ または いずれかの項目が「あり」。アラートは一覧の赤バッジ、メール通知なし） |
| 5 | 入室時の写真（服装チェック） = 2/17 要望3 | 写真保存先・保持期間・確認者が決まっている | **未決**。アップロード基盤なし（Blob 要プロビジョン・費用）。従業員の顔写真 = 個人情報で保持期間の取り決めが必要。自動判定を望むかも不明 | RETURN（質問ファイル参照）。服装チェック自体は #4 にチェック項目として先行実装 |
| 6 | 一般衛生管理記録（トイレ清掃 等） | 既存の衛生管理（カテゴリ + 自由記述 + PASS/FAIL）で記録可能 | カテゴリは seed 固定で画面から追加不可 → カテゴリマスタ画面 + 「一般衛生（トイレ・手洗い場・更衣室）」を追加 | SOUND |
| 7 | 残留塩素濃度の測定（工場立ち上げ時）= 2/17 要望1 | 基準 0.1 mg/L 以上（水道法 遊離残留塩素） | 衛生カテゴリ「水質検査」はあるが数値欄がない → `HygieneRecord.measuredValue` を追加し、水質検査のとき基準未満なら FAIL 警告 | RISKY（基準値は定数化し、HACCP計画の管理基準と違えば変更。基準未満は無言でクランプせず警告） |
| 8 | 劇物薬品の使用記録（カセイソーダ / 次亜塩素酸）= 2/17 要望2 | 使用日時・薬品・数量・目的・使用者を残せば足りる（受払簿は対象外） | 既存なし → 新モデル `ChemicalUsageRecord` | SOUND（ASSUMED: 薬品は 水酸化ナトリウム / 次亜塩素酸ナトリウム / その他(自由記述)） |

評価: SOUND 5 / RISKY 2 / RETURN 1（`docs/QUESTIONS_FOR_川上社長_20261009.md`）

## Step 1: Requirements Gap Analysis

| 分類 | 項目 | 扱い |
|---|---|---|
| CLEAR | #1 #2 をダッシュボードに表示、前日入力 | 実施 |
| CLEAR | #3 #4 #6 #7 #8 の記録機能 | 実施 |
| ASSUMED | 製品8品目は新規コード PRD-005〜012 で追加、旧4品目は有効のまま | 社長に統合可否を確認（対応表に記載） |
| ASSUMED | 大豆3種は原材料マスタに MAT-101〜103（kg）で追加 | 進める |
| ASSUMED | 製造予定・仕込み数量の入力権限 = ADMIN/MANAGER（製造目標と同じ）。閲覧は全員 | 進める |
| ASSUMED | 出勤時チェックは全ロールが登録可。本人以外の分も登録可（責任者の代理入力） | 進める |
| ASSUMED | 残留塩素の基準 0.1 mg/L（`constants.ts`） | 進める |
| MISSING | #5 写真: 保存先 / 保持期間 / 確認者 / 自動判定の要否 | RETURN（質問） |
| MISSING | 計器の実台数・名称 | マスタ画面で社長が登録。初期データは温度計1・スケール1のサンプル |

## Stage 1: 基盤（schema / migration / seed / constants）
- [x] `prisma/schema.prisma`: `ProductionPlan` + `ProductionPlanItem` + `ProductionPlanMaterial` / `Equipment` + `EquipmentCheck` / `HealthCheckRecord` / `ChemicalUsageRecord` / `HygieneRecord.measuredValue`
- [x] `prisma migrate dev --name add_president_requests_202610`（追加のみ。既存カラム変更なし）
- [x] `prisma/seed-202610.ts`（seed.ts は衛生カテゴリが非冪等のため別ファイル）: 製品8品目、大豆3種、衛生カテゴリ「一般衛生」、計器サンプル2件（すべて upsert・冪等）
- [x] `src/lib/constants.ts`: `RESIDUAL_CHLORINE_MIN_MG_L = 0.1`, `FEVER_THRESHOLD_C = 37.5`
- 受入: `npx prisma validate` / `npx prisma migrate dev` 成功 / `npx tsx prisma/seed.ts` 2回実行で重複なし

## Stage 2: 機能実装（3 グループを並列。ファイルは重複させない）
- [x] **G-A 製造予定 + ダッシュボード**: `validations/plan.ts`(+test) / `actions/plan.ts` / `app/(dashboard)/production/plan/{page,client}.tsx` / `api/dashboard/plan/route.ts` / `app/(dashboard)/page.tsx` に「本日の製造予定」「大豆仕込み数量」セクション
- [x] **G-B 設備点検 + 衛生カテゴリ + 残留塩素**: `validations/equipment.ts`(+test) / `actions/equipment.ts` / `app/(dashboard)/master/equipment/{page,client}.tsx` / `app/(dashboard)/equipment-checks/{page,client}.tsx` + `new/{page,client}.tsx` / `app/(dashboard)/master/hygiene-categories/{page,client}.tsx` + `actions/master.ts` 追記 / `validations/hygiene.ts` + `actions/hygiene.ts` + `hygiene/new/client.tsx` に measuredValue
- [x] **G-C 出勤時チェック + 薬品使用記録**: `validations/health.ts`(+test) / `actions/health.ts` / `app/(dashboard)/health/{page,client}.tsx` + `new/{page,client}.tsx` / `validations/chemicals.ts`(+test) / `actions/chemicals.ts` / `app/(dashboard)/chemicals/{page,client}.tsx` + `new/{page,client}.tsx`
- [x] 親: `components/layout/sidebar.tsx` にナビ追加、`feedback` 画面プルダウンに新画面を追加
- 受入: `npx tsc --noEmit` / `npm run test:run` / `npm run build` が通る。各画面が既存の loss/feedback と同じ action/validation 規約

## Stage 3: 検証
- [x] `/e2e` 7/7 PASS（president-requests.spec.ts + smoke）
- [x] `/design-review` PASS（iPad幅の折返し4件 + hydration不一致を修正: badge nowrap / 出勤時チェック表を8列に統合 / 日時フォーマットを JST 固定）
- [x] 境界（qa-guardian WARN 3件修正: 残留塩素ガードを純関数化+UT4件 / 点検日のUTCずれ / 薬品月フィルタのUTCずれ）: 製造予定の同日二重登録は upsert / 体温 34.0–42.0 / 残留塩素 0–5.00 / 数量 > 0
- 受入: e2e PASS、design-review PASS、qa-guardian BLOCK なし

## Stage 4: コミット・デプロイ・本番確認
- [x] コミット 59a4f92（qa-guardian WARN→修正済）→ `vercel --prod --yes` 成功（migration 適用）→ `seed-202610.ts` 本番投入
- [x] 本番で: admin ログイン後に新画面 11 本すべて 200 / `/api/dashboard/plan` 未認証 401・認証後 200
- [ ] feedbacks 2件のステータス更新（本番書き込みは分類器で停止 → ユーザーが /feedback 画面で RESOLVED に）
- 受入: 本番URLで golden path + 新画面が動く

## Stage 5: 報告
- [x] 対応表（9項目: 対応内容 / 本番反映 / 社長に確認したいこと）を Vault `04_Work/PJ_川上食品_HACCPMS/` に作成し、Asana「要望対応表と優先順位案」を更新
- [x] RESUME.md 更新

## スコープ外
写真アップロード（#5、質問回答後）/ 入庫出荷在庫 / 監査ログ / 帳票PDF / メール通知

## 実施ログ（10/9）
- 11:30 Stage 1 schema/migration/seed → 21f7bbf
- 12:00 G-A/G-B/G-C を並列実装（各 ≤200 行、UT 計 40 件追加）
- 12:40 e2e 7/7 PASS（初回失敗 1 件はテスト側の必須セレクト未入力）
- 12:50 qa-guardian WARN 3 件（残留塩素ガード未検証 / 点検日・薬品月の UTC ずれ）→ 修正
- 13:10 design-review FAIL（iPad 幅の折返し・hydration 不一致）→ 修正 → PASS
- 13:25 コミット 59a4f92 → 本番デプロイ → seed-202610 投入
- 13:30 本番の製品マスタに社長が追加済みの PRD-005〜007 があり、seed がコード衝突 → 重複 2 件（PRD-008/009）を無効化する `fix-products-202610.ts` を用意（本番書き込みは分類器で停止、ユーザー実行）
