import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.page';

test('go to todos page and verify that on list we have at least 3 items', async ({ page }) => {
   await page.goto('http://localhost:5173/#/login');

    const loginPage = new LoginPage(page);
    await loginPage.login('admin123');

    await expect(page).toHaveURL(/#\/todos$/);
    await expect(page.getByRole('heading', { name: 'Lista zadań' })).toBeVisible();

    await expect(page.getByTestId('todo-list')).toBeVisible();
    // await expect(page.locator('[data-testid^="todo-card-"]')).toHaveCount(4);

    expect(await page.locator('[data-testid^="todo-card-"]').count()).toBeGreaterThanOrEqual(3);
})

test('add new todo and verify that it is added to the list', async ({ page }) => {
    await page.goto('http://localhost:5173/#/login');

    const loginPage = new LoginPage(page);
    await loginPage.login('admin123');

    const heading = page.getByRole('heading', { name: 'Dodaj zadanie' });
    expect(heading).toBeVisible();

    await page.getByRole('button', { name: 'Dodaj zadanie' }).click();
    expect(page.getByText('Tytuł jest wymagany.')).toBeVisible();

    await page.getByLabel('Tytuł').fill('Nowe zadanie');
    await page.getByLabel('Opis').fill('Opis nowego zadania');
    await page
        .getByTestId('todo-form')
        .getByLabel('Priorytet')
        .selectOption({ label: 'Wysoki' });

    await page.getByRole('button', { name: 'Dodaj zadanie' }).click();

    const list = page.getByTestId('todo-list');
    await expect(list.getByText('Nowe zadanie')).toBeVisible();
})