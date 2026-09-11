import { test, expect } from '@playwright/test';

test.describe('Web Logbook Suite', () => {
  test('AuthGate renders strictly with Google OAuth and no bypass buttons', async ({ page }) => {
    await page.goto('/');

    // Check title and branding
    await expect(page).toHaveTitle(/Logbook By Naufal/i);
    
    // AuthGate header check
    const heading = page.getByRole('heading', { name: /Logbook By Naufal/i });
    await expect(heading).toBeVisible();

    // Verify student profile details in gate
    await expect(page.getByText(/Naufal Irfansyah Saputra/i).first()).toBeVisible();
    await expect(page.getByText(/Sistem Catatan Harian & Presensi Magang/i).first()).toBeVisible();

    // Verify Google Client ID is active and official security note is shown
    await expect(page.getByText(/Google Client ID Terhubung/i)).toBeVisible();
    await expect(page.getByText(/Autentikasi Resmi Google OAuth/i)).toBeVisible();

    // Ensure bypass buttons DO NOT exist
    await expect(page.getByText(/Akses Cepat Pengujian/i)).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Masuk Akun/i })).not.toBeVisible();
  });

  test('Super Admin authenticated session unlocks full dashboard with verifier privileges', async ({ page }) => {
    // Inject authenticated Super Admin session for naufalfaster@gmail.com
    await page.addInitScript(() => {
      localStorage.setItem('logbook_active_user', JSON.stringify({
        id: 'admin-1',
        email: 'naufalfaster@gmail.com',
        user_metadata: {
          full_name: 'Naufal Irfansyah Saputra',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
        }
      }));
    });

    await page.goto('/');

    // Verify we entered the dashboard with Super Admin & PRO perks
    await expect(page.getByText(/Magang RSGM UMY/i).first()).toBeVisible();
    await expect(page.getByText(/Admin/i).first()).toBeVisible();
    await expect(page.getByText(/PRO/i).first()).toBeVisible();
    await expect(page.getByText(/Naufal Irfansyah Saputra/i).first()).toBeVisible();
  });

  test('Regular student authenticated session unlocks dashboard in Free tier mode', async ({ page }) => {
    // Inject authenticated student session
    await page.addInitScript(() => {
      localStorage.setItem('logbook_active_user', JSON.stringify({
        id: 'student-1',
        email: 'mahasiswa.magang@gmail.com',
        user_metadata: {
          full_name: 'Mahasiswa Magang RSGM',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        }
      }));
    });

    await page.goto('/');

    // Verify dashboard displays in Free tier mode
    await expect(page.getByText(/Magang RSGM UMY/i).first()).toBeVisible();
    await expect(page.getByText(/FREE/i).first()).toBeVisible();
  });
});
