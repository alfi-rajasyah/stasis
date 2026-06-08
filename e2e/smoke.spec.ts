import { test, expect } from '@playwright/test';

test.describe('Stasis Smoke Tests', () => {

  test('Dashboard loads and shows key elements', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');

    // Wait for data to load via tRPC - h1 only appears after React Query resolves
    await page.waitForSelector('h1', { timeout: 30000 });

    // Verify month header (format: YYYY-MM, e.g. "2026-06")
    await expect(page.locator('h1')).toContainText('2026');

    // Verify the 3 main cards exist (look for formatted IDR amounts)
    await expect(page.getByText(/Rp/).first()).toBeVisible();

    await expect(page.getByText(/Upcoming/i).first()).toBeVisible();
    await expect(page.getByText(/Debts/i).first()).toBeVisible();

    // Verify floating AI button (use exact match to avoid tab-bar collision)
    await expect(page.getByRole('link', { name: '🤖', exact: true })).toBeVisible();

    // Verify tab bar (scope to nav to avoid page content collisions)
    const tabBar = page.locator('nav');
    await expect(tabBar.getByText('Dashboard')).toBeVisible();
    await expect(tabBar.getByText('Budget')).toBeVisible();
    await expect(tabBar.getByText('Trackers')).toBeVisible();

    expect(errors).toHaveLength(0);
  });

  test('Budget page loads and shows allocations', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/budget');

    // Wait for budget data to load and verify income summary (Rp formatted amount)
    await expect(page.getByText(/Rp/).first()).toBeVisible({ timeout: 15000 });

    await expect(page.getByText('Housing').first()).toBeVisible();
    await expect(page.getByText('Food & Dining').first()).toBeVisible();

    // Verify tab bar (scope to nav to avoid page content collisions)
    const tabBar = page.locator('nav');
    await expect(tabBar.getByText('Dashboard')).toBeVisible();
    await expect(tabBar.getByText('Budget')).toBeVisible();
    await expect(tabBar.getByText('Settings')).toBeVisible();

    expect(errors).toHaveLength(0);
  });

  test('Navigation via tab bar works', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');

    // Wait for dashboard data to load before interacting with tabs
    await page.waitForSelector('h1', { timeout: 30000 });

    const tabBar = page.locator('nav');

    // Click Budget tab
    await tabBar.getByText('Budget').click();
    await expect(page).toHaveURL(/\/budget/);

    // Click Trackers tab → placeholder shows Sprint 2
    await tabBar.getByText('Trackers').click();
    await expect(page).toHaveURL(/\/trackers/);
    await expect(page.getByText(/Sprint 2/)).toBeVisible();

    // Click Settings tab → placeholder shows Sprint 4
    await tabBar.getByText('Settings').click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByText(/Sprint 4/)).toBeVisible();

    expect(errors).toHaveLength(0);
  });

  test('Placeholder pages show correct sprint messages', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/trackers');
    await expect(page.getByText(/Sprint 2/)).toBeVisible();

    await page.goto('/chat');
    await expect(page.getByText(/Sprint 3/)).toBeVisible();

    await page.goto('/settings');
    await expect(page.getByText(/Sprint 4/)).toBeVisible();

    expect(errors).toHaveLength(0);
  });
});
