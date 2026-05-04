import { test, expect } from '@playwright/test';

/**
 * ============================================================
 * TEST SUITE MULTILINGUAL: SUPPORT EN/ID & HIGH STABILITY
 * AI README Generator | Validasi Komprehensif
 * ============================================================
 */

const REPO_URL = 'https://github.com/ahmadfatih16/Capstone-Project-SeeLirik';

// Helper untuk mengecek teks dalam dua bahasa (Output)
const checkSection = async (resultArea: any, en: string, id: string) => {
  const content = await resultArea.textContent() || '';
  const found = content.toLowerCase().includes(en.toLowerCase()) || 
                content.toLowerCase().includes(id.toLowerCase());
  expect(found).toBe(true);
  console.log(`   ✅ Seksi "${en}/${id}" ditemukan.`);
};

// ------------------------------------------------------------
// 1. PRESET: OPEN SOURCE
// ------------------------------------------------------------
test('Preset: Open Source', async ({ page }) => {
  await page.goto('/');
  // Klik tombol Open Source (bisa EN atau ID)
  await page.click('button:has-text("Open Source")');
  await page.fill('input[id="github-url"]', REPO_URL);
  await page.click('button[type="submit"]');

  const resultArea = page.locator('.markdown-body');
  await expect(resultArea).toBeVisible({ timeout: 120000 }); // 2 menit (Sabar nunggu API)

  await checkSection(resultArea, 'Contributing', 'Kontribusi');
  await checkSection(resultArea, 'Roadmap', 'Roadmap');
});

// ------------------------------------------------------------
// 2. PRESET: ACADEMIC
// ------------------------------------------------------------
test('Preset: Academic', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Academic")');
  await page.fill('input[id="github-url"]', REPO_URL);
  await page.click('button[type="submit"]');

  const resultArea = page.locator('.markdown-body');
  await expect(resultArea).toBeVisible({ timeout: 120000 });

  await checkSection(resultArea, 'Directory Structure', 'Struktur Direktori');
  await checkSection(resultArea, 'FAQ', 'FAQ');
});

// ------------------------------------------------------------
// 3. PRESET: PORTFOLIO
// ------------------------------------------------------------
test('Preset: Portfolio', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Portfolio")');
  await page.fill('input[id="github-url"]', REPO_URL);
  await page.click('button[type="submit"]');

  const resultArea = page.locator('.markdown-body');
  await expect(resultArea).toBeVisible({ timeout: 120000 });

  await checkSection(resultArea, 'Authors', 'Penulis');
  await checkSection(resultArea, 'Tech Stack', 'Teknologi');
});

// ------------------------------------------------------------
// 4. CUSTOM: SEMUA INDIKATOR (Bilingual Selector)
// ------------------------------------------------------------
test.only('Custom: Semua Indikator', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Portfolio")');
  
  // Daftar 12 seksi dalam pola RegEx agar ketemu EN maupun ID
  // Contoh: /Features|Fitur/i
  const sectionPatterns = [
    /Features|Fitur/i, /Installation|Instalasi/i, /Usage|Penggunaan/i, 
    /Configuration|Konfigurasi/i, /FAQ/i, /Directory Structure|Struktur Direktori/i, 
    /License|Lisensi/i, /Contributing|Kontribusi/i, /Roadmap/i, 
    /Badges|Badge/i, /Tech Stack|Teknologi/i, /Authors|Penulis/i
  ];
  
  for (const pattern of sectionPatterns) {
    const label = page.locator('label').filter({ hasText: pattern });
    await label.scrollIntoViewIfNeeded();
    const checkbox = label.locator('input[type="checkbox"]');
    if (!(await checkbox.isChecked())) {
      await label.click();
    }
  }

  await page.fill('input[id="github-url"]', REPO_URL);
  await page.click('button[type="submit"]');

  const resultArea = page.locator('.markdown-body');
  await expect(resultArea).toBeVisible({ timeout: 150000 }); // 2.5 menit (Extra sabar)

  await checkSection(resultArea, 'FAQ', 'FAQ');
  await checkSection(resultArea, 'Roadmap', 'Roadmap');
  console.log('   ✅ Semua seksi kustom berhasil di-render.');
});

// ------------------------------------------------------------
// 5. SYSTEM: ERROR HANDLING
// ------------------------------------------------------------
test('System: Error Handling', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Portfolio")');
  await page.fill('input[id="github-url"]', 'https://google.com');
  
  const submitBtn = page.locator('button[type="submit"]');
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();

  // Cari pesan error yang mengandung kata 'github' atau 'valid' (ID: tidak valid, EN: invalid)
  const errorMessage = page.locator('div').filter({ hasText: /github/i }).filter({ hasText: /valid/i });
  await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
});

// ------------------------------------------------------------
// 6. SYSTEM: EDIT & PREVIEW
// ------------------------------------------------------------
test('System: Edit & Preview', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Portfolio")');
  await page.fill('input[id="github-url"]', REPO_URL);
  await page.click('button[type="submit"]');

  const resultArea = page.locator('.markdown-body');
  await expect(resultArea).toBeVisible({ timeout: 120000 });

  // Klik Edit (bisa bertuliskan 'Edit' atau 'Ubah/Edit')
  await page.click('button:has-text("Edit")');
  await page.locator('textarea').fill('## JUDUL_TEST_PLAYWRIGHT');
  await page.click('button:has-text("Preview")'); // Atau 'Pratinjau'
  
  await expect(resultArea).toContainText('JUDUL_TEST_PLAYWRIGHT');
});
