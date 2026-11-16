import { test, expect } from '@playwright/test';

test.describe('Ready2Hire E2E Capstone Verification Suite', () => {
  test('Landing page renders brand, value proposition and navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Ready2Hire/);
    await expect(page.locator('text=Ready2Hire').first()).toBeVisible();
    await expect(page.locator('text=Standardized skill grading').first()).toBeVisible();
  });

  test('Demo role switcher seamlessly transitions to Student Dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Student")');
    await page.waitForURL('**/applicant');
    await expect(page.locator('text=Welcome back').first()).toBeVisible();
  });

  test('Demo role switcher transitions to Recruiter Dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Recruiter")');
    await page.waitForURL('**/recruiter');
    await expect(page.locator('text=Recruitment Pipeline').first()).toBeVisible();
  });

  test('Demo role switcher transitions to Admin Master Console', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Admin")');
    await page.waitForURL('**/admin');
    await expect(page.locator('text=Institutional Administration').first()).toBeVisible();
  });

  test('5-Agent Resume Analyzer runs and outputs scores', async ({ page }) => {
    await page.goto('/resume-analyzer');
    await page.click('button:has-text("Execute 5-Agent Pipeline")');
    await expect(page.locator('text=Overall Alignment').first()).toBeVisible();
    await expect(page.locator('text=Skills Match').first()).toBeVisible();
  });

  test('Job portal search and filters work correctly', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.locator('text=Explore Engineering').first()).toBeVisible();
    await page.fill('input[placeholder*="Job title, skills"]', 'Backend');
    await expect(page.locator('text=Backend').first()).toBeVisible();
  });
});
