import { test, expect } from '@playwright/test';

test.describe('Isolasi User & Tambah Program Super User', () => {
  test('1 User 1 Logbook: Data entri terisolasi per akun', async ({ page }) => {
    // Navigate to page first
    await page.goto('/');

    // User A session with personal entries in localStorage
    await page.evaluate(() => {
      const userA = {
        id: 'user-a-uuid',
        email: 'userA@gmail.com',
        user_metadata: {
          full_name: 'Mahasiswa A',
          avatar_url: ''
        }
      };
      localStorage.setItem('logbook_active_user', JSON.stringify(userA));
      localStorage.setItem('logbook_entries_user-a-uuid', JSON.stringify({
        magang: [
          {
            id: 'entry-a-1',
            date: '2026-09-10',
            startTime: '08:00',
            endTime: '12:00',
            durationHours: 4,
            category: 'Aktivitas Rahasia User A',
            title: 'Eksperimen Khusus User A',
            description: 'Catatan logbook milik mahasiswa A saja',
            status: 'submitted',
            createdAt: '2026-09-10T08:00:00Z'
          }
        ]
      }));
    });

    await page.reload();

    // Verify User A sees their own entry
    await expect(page.getByText('Eksperimen Khusus User A')).toBeVisible();

    // Now simulate switching to User B on the same machine
    await page.evaluate(() => {
      const userB = {
        id: 'user-b-uuid',
        email: 'userB@gmail.com',
        user_metadata: {
          full_name: 'Mahasiswa B',
          avatar_url: ''
        }
      };
      localStorage.setItem('logbook_active_user', JSON.stringify(userB));
      // User B has clean logbook
      localStorage.setItem('logbook_entries_user-b-uuid', JSON.stringify({}));
    });

    await page.reload();

    // Verify User B DOES NOT see User A's entry
    await expect(page.getByText('Eksperimen Khusus User A')).not.toBeVisible();
    await expect(page.getByText('Belum Ada Catatan Kegiatan')).toBeVisible();
  });

  test('Super User dapat menambah program kustom baru', async ({ page }) => {
    // Inject Super User session
    await page.addInitScript(() => {
      localStorage.setItem('logbook_active_user', JSON.stringify({
        id: 'admin-naufal',
        email: 'naufalfaster@gmail.com',
        user_metadata: {
          full_name: 'Naufal Irfansyah Saputra',
          avatar_url: ''
        }
      }));
    });

    await page.goto('/settings');

    // Check Super User "+ Tambah Program Baru" button is visible
    const addProgBtn = page.getByRole('button', { name: /\+ Tambah Program Baru/i });
    await expect(addProgBtn).toBeVisible();

    // Open Modal
    await addProgBtn.click();

    // Modal should be open
    await expect(page.getByRole('heading', { name: /Tambah Program Baru/i })).toBeVisible();

    // Fill Program form
    await page.getByPlaceholder(/Contoh: Studi Independen AI/i).fill('Studi Independen AI');
    await page.getByPlaceholder(/Penjelasan singkat mengenai fokus kegiatan/i).fill('Pelatihan intensif bidang artificial intelligence');

    // Click submit
    await page.getByRole('button', { name: /Simpan & Aktifkan Program/i }).click();

    // Verify the custom program is added and displayed with "Kustom" badge
    await expect(page.getByText('Studi Independen AI').first()).toBeVisible();
    await expect(page.getByText('Kustom').first()).toBeVisible();

    // Navigate to Dashboard and check the new program tab exists
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Studi Independen AI' })).toBeVisible();
  });
});
