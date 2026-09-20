import { test, expect } from '@playwright/test';

// Golden path against a deployed environment.
// Required env: E2E_BASE_URL, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
const email = process.env.E2E_ADMIN_EMAIL ?? 'admin@kawakami-foods.co.jp';
const password = process.env.E2E_ADMIN_PASSWORD ?? '';

test.describe('production golden path', () => {
  test.skip(!password, 'E2E_ADMIN_PASSWORD not set');

  test('unauthenticated API returns 401 and pages redirect to login', async ({ request, page }) => {
    const res = await request.get('/api/auth/me');
    expect(res.status()).toBe(401);
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login → dashboard → temperature alert → lot trace → loss report → logout', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Dashboard
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('本日の製造数量')).toBeVisible();
    await expect(page.getByText('温度異常件数')).toBeVisible();

    // Temperature: record an out-of-range value on 冷蔵庫A (upper limit 5.0)
    await page.goto('/temperature/new');
    const facilityValue = await page.locator('select[name="facilityId"] option', { hasText: '冷蔵庫A' }).getAttribute('value');
    await page.selectOption('select[name="facilityId"]', facilityValue!);
    await page.fill('input[name="temperature"]', '9.5');
    await page.fill('textarea[name="notes"]', 'E2E 本番検証（異常値）');
    // The header also has a submit button (logout form) — target by label
    await page.getByRole('button', { name: '記録する' }).click();
    await expect(page).toHaveURL(/\/temperature$/);
    await expect(page.getByText('9.5').first()).toBeVisible();

    // Alert is generated
    await page.goto('/temperature/alerts');
    await expect(page.getByText('未対応').first()).toBeVisible();

    // Lot trace: open the first product lot and see backward trace
    await page.goto('/lots?tab=product');
    const firstLot = page.locator('a[href^="/lots/"]').first();
    await expect(firstLot).toBeVisible();
    await firstLot.click();
    await expect(page.getByRole('heading', { name: 'ロットトレース' })).toBeVisible();
    await expect(page.getByText('後方追跡')).toBeVisible();
    await expect(page.getByText('大豆（国産）').first()).toBeVisible();

    // Loss report renders
    await page.goto('/loss/report');
    await expect(page.getByRole('heading').first()).toBeVisible();

    // Logout
    await page.getByRole('button', { name: 'ログアウト' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
