import { test, expect } from '@playwright/test';

test.describe('Web Logbook Suite', () => {
  test('AuthGate renders correctly when not signed in', async ({ page }) => {
    await page.goto('/');

    // Check title and branding
    await expect(page).toHaveTitle(/Logbook By Naufal/i);
    
    // AuthGate header check
    const heading = page.getByRole('heading', { name: /Logbook By Naufal/i });
    await expect(heading).toBeVisible();

    // Verify student profile details in gate
    await expect(page.getByText(/Naufal Irfansyah Saputra/i).first()).toBeVisible();
    await expect(page.getByText(/Sistem Catatan Harian & Presensi Magang/i).first()).toBeVisible();

    // Verify login action buttons exist
    await expect(page.getByText(/Google Client ID Terhubung/i)).toBeVisible();
    await expect(page.getByText(/Masuk sebagai naufalfaster@gmail.com/i)).toBeVisible();
    await expect(page.getByText(/Masuk sebagai Naufal Irfansyah Saputra/i)).toBeVisible();
  });

  test('Super Admin login unlocks full dashboard with verifier privileges', async ({ page }) => {
    await page.goto('/');

    // Click Super Admin login button
    const adminButton = page.getByRole('button', { name: /Masuk sebagai naufalfaster@gmail.com/i });
    await adminButton.click();

    // Verify we entered the dashboard
    await expect(page.getByText(/Magang RSGM UMY/i).first()).toBeVisible();
    await expect(page.getByText(/Admin/i).first()).toBeVisible();
    await expect(page.getByText(/PRO/i).first()).toBeVisible();
    await expect(page.getByText(/Naufal Irfansyah Saputra/i).first()).toBeVisible();
  });

  test('Student login unlocks dashboard in Free tier mode', async ({ page }) => {
    await page.goto('/');

    // Click Student login button
    const studentButton = page.getByRole('button', { name: /Masuk sebagai Naufal Irfansyah Saputra/i });
    await studentButton.click();

    // Verify dashboard displays
    await expect(page.getByText(/Magang RSGM UMY/i).first()).toBeVisible();
    await expect(page.getByText(/D3 Teknik Gigi/i).first()).toBeVisible();
    await expect(page.getByText(/FREE/i).first()).toBeVisible();
  });
});
