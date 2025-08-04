import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Seraphim Vanguard/);
    await expect(page.locator('h1')).toContainText('Sign In');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in valid credentials
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.locator('button[type="submit"]').click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Should show user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard');
    
    // Click user menu
    await page.locator('[data-testid="user-menu"]').click();
    
    // Click logout
    await page.locator('text=Sign Out').click();
    
    // Should redirect to login page
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.locator('text=Create an account').click();
    
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h1')).toContainText('Create Account');
    await expect(page.locator('input[name="displayName"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('should register new user', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('input[name="displayName"]', 'Test User');
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    
    await page.locator('button[type="submit"]').click();
    
    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="displayName"]', 'Test User');
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
    
    await page.locator('button[type="submit"]').click();
    
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });
});