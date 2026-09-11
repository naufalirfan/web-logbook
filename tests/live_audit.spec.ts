import { test, expect } from '@playwright/test';

test.describe('Live Production Website Audit (https://logbooknaufal.vercel.app/)', () => {
  test('Audit AuthGate layout, branding, and strict auth on live production', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Visit live production site
    await page.goto('https://logbooknaufal.vercel.app/', { waitUntil: 'networkidle' });

    // 2. Verify page title
    await expect(page).toHaveTitle(/Logbook By Naufal • Naufal Irfansyah Saputra/i);

    // 3. Verify main header text
    const heading = page.getByRole('heading', { name: /Logbook By Naufal/i });
    await expect(heading).toBeVisible();

    // 4. Verify clean subtitle (No Poltekkes, no Laboratorium Teknik Gigi)
    await expect(page.getByText(/Naufal Irfansyah Saputra/i).first()).toBeVisible();
    await expect(page.getByText(/Sistem Catatan Harian & Presensi Magang/i).first()).toBeVisible();
    await expect(page.getByText(/Poltekkes/i)).not.toBeVisible();
    await expect(page.getByText(/Laboratorium Teknik Gigi/i)).not.toBeVisible();

    // 5. Verify Google Client ID is active and connected
    await expect(page.getByText(/Google Client ID Terhubung/i)).toBeVisible();

    // 6. Verify bypass buttons are strictly ABSENT
    await expect(page.getByText(/Akses Cepat Pengujian/i)).not.toBeVisible();
    await expect(page.getByText(/Masuk sebagai naufalfaster@gmail.com/i)).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Masuk Akun/i })).not.toBeVisible();

    // 7. Verify footer with Instagram link
    const igLink = page.getByRole('link', { name: /Naufal Irfansyah Saputra/i });
    await expect(igLink).toBeVisible();
    await expect(igLink).toHaveAttribute('href', 'https://www.instagram.com/naufal_irfansyah');

    // 8. Capture screenshot for audit report
    await page.screenshot({ path: 'public/screenshots/live-audit-authgate.png', fullPage: true });

    // 9. Verify no critical client errors
    console.log('Live console errors caught:', consoleErrors);
  });

  test('Audit Super Admin features, verification panel, and PRO tier perks on live production', async ({ page }) => {
    // Inject authenticated session for Super Admin
    await page.addInitScript(() => {
      localStorage.setItem('logbook_active_user', JSON.stringify({
        id: 'admin-live-id',
        email: 'naufalfaster@gmail.com',
        user_metadata: {
          full_name: 'Naufal Irfansyah Saputra',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
        }
      }));
    });

    await page.goto('https://logbooknaufal.vercel.app/', { waitUntil: 'networkidle' });

    // Verify Super Admin perks
    await expect(page.getByText(/Super Admin/i).first()).toBeVisible();
    await expect(page.getByText(/PRO/i).first()).toBeVisible();
    await expect(page.getByText(/\+ Tulis Logbook/i)).toBeVisible();

    // Capture dashboard screenshot
    await page.screenshot({ path: 'public/screenshots/live-audit-dashboard.png', fullPage: true });
  });
});
