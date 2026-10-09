import { test, expect, Page } from '@playwright/test';

// Smoke tests for the 2026-10 president requests.
// Local: default admin credentials from prisma/seed.ts. Against production set
// E2E_BASE_URL / E2E_ADMIN_PASSWORD (records created here stay as real data — delete after).
const email = process.env.E2E_ADMIN_EMAIL ?? 'admin@kawakami-foods.co.jp';
const password = process.env.E2E_ADMIN_PASSWORD ?? 'admin1234';
const stamp = `E2E ${new Date().toISOString().slice(0, 16)}`;

function localDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page).toHaveURL(/\/$/);
}

test.describe('president requests 2026-10', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('production plan: set today → dashboard shows plan and soybean prep', async ({ page }) => {
    await page.goto(`/production/plan?date=${localDate(0)}`);
    await expect(page.getByRole('heading', { name: /製造予定/ }).first()).toBeVisible();
    // Quantity inputs are labelled by product / material name
    await page.getByLabel('木綿豆腐', { exact: true }).fill('120');
    await page.getByLabel('一般大豆', { exact: true }).fill('45.5');
    await page.getByRole('button', { name: /保存/ }).click();
    await expect(page.getByText(/保存しました/)).toBeVisible();

    await page.goto('/');
    await expect(page.getByText('本日の製造予定')).toBeVisible();
    await expect(page.getByText('大豆仕込み数量')).toBeVisible();
    await expect(page.getByText('120').first()).toBeVisible();
    await expect(page.getByText('45.5').first()).toBeVisible();
  });

  test('health check: abnormal temperature is flagged', async ({ page }) => {
    await page.goto('/health/new');
    await expect(page.getByRole('heading', { name: '出勤時チェック登録' })).toBeVisible();
    // (userId, checkDate) is unique: use a varying past date so the test is re-runnable
    const past = new Date(Date.now() - (1 + (Math.floor(Date.now() / 60000) % 700)) * 86400000).toISOString().slice(0, 10);
    await page.fill('input[name="checkDate"]', past);
    await page.fill('input[name="bodyTemperature"]', '37.8');
    await page.fill('textarea[name="notes"]', stamp);
    await page.getByRole('button', { name: '登録する' }).click();
    await expect(page).toHaveURL(/\/health$/);
    await expect(page.getByText('37.8').first()).toBeVisible();
    await expect(page.getByText('異常').first()).toBeVisible();
  });

  test('chemical usage: OTHER requires a name, then records', async ({ page }) => {
    await page.goto('/chemicals/new');
    await page.selectOption('select[name="chemicalKind"]', 'OTHER');
    await page.fill('input[name="quantity"]', '2.5');
    await page.fill('textarea[name="purpose"], input[name="purpose"]', `配管洗浄 ${stamp}`);
    await page.getByRole('button', { name: '記録する' }).click();
    await expect(page.getByText(/薬品名/)).toBeVisible(); // validation error stays on the form

    await page.fill('input[name="chemicalName"]', 'E2E試薬');
    await page.getByRole('button', { name: '記録する' }).click();
    await expect(page).toHaveURL(/\/chemicals$/);
    await expect(page.getByText('E2E試薬').first()).toBeVisible();
  });

  test('equipment check: record and due status', async ({ page }) => {
    await page.goto('/equipment-checks/new');
    const scale = await page.locator('select[name="equipmentId"] option', { hasText: 'スケール' }).getAttribute('value');
    await page.selectOption('select[name="equipmentId"]', scale!);
    await page.selectOption('select[name="kind"]', 'INSPECTION');
    await page.selectOption('select[name="result"]', 'PASS');
    await page.getByRole('button', { name: /記録|登録/ }).click();
    await expect(page).toHaveURL(/\/equipment-checks$/);
    await expect(page.getByText('スケール').first()).toBeVisible();
    await expect(page.getByText('実施済').first()).toBeVisible();
  });

  test('hygiene: water test below 0.1 mg/L is forced to FAIL', async ({ page }) => {
    await page.goto('/hygiene/new');
    const water = await page.locator('select[name="categoryId"] option', { hasText: '水質検査' }).getAttribute('value');
    await page.selectOption('select[name="categoryId"]', water!);
    await expect(page.getByText(/残留塩素濃度/)).toBeVisible();
    await page.fill('input[name="measuredValue"]', '0.05');
    await page.fill('textarea[name="details"], input[name="details"]', `残留塩素測定 ${stamp}`);
    await page.selectOption('select[name="result"]', 'PASS');
    await page.getByRole('button', { name: /記録|登録/ }).click();
    await expect(page).toHaveURL(/\/hygiene$/);
    const row = page.locator('tr', { hasText: stamp }).first();
    await expect(row.getByText('0.05')).toBeVisible();
    await expect(row.getByText('不合格')).toBeVisible(); // forced FAIL despite PASS being selected
  });

  test('masters: equipment and hygiene category screens render', async ({ page }) => {
    await page.goto('/master/equipment');
    await expect(page.getByText('温度計').first()).toBeVisible();
    await page.goto('/master/hygiene-categories');
    await expect(page.getByText('一般衛生').first()).toBeVisible();
  });
});
