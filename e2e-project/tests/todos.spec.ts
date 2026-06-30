import { test, expect } from '@playwright/test';

test('go to todos page and verify that on list we have at least 3 items', async ({ page }) => {
   await page.goto('http://localhost:5173/#/login');

    await page.getByLabel('Hasło').fill('admin123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();

    await expect(page).toHaveURL(/#\/todos$/);
    await expect(page.getByRole('heading', { name: 'Lista zadań' })).toBeVisible();

    await expect(page.getByTestId('todo-list')).toBeVisible();
    // await expect(page.locator('[data-testid^="todo-card-"]')).toHaveCount(4);

    expect(await page.locator('[data-testid^="todo-card-"]').count()).toBeGreaterThanOrEqual(3);
})