import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.page';
import { TodosPage } from './pages/TodosPage.page';

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

test.describe('add new todo', () => {
    test.use({ storageState: '.auth/user.json' });

    test('add new todo and verify that it is added to the list', async ({ page }) => {
        await page.addInitScript(() => {
            sessionStorage.setItem('todolab.authenticated', 'true');
        });

        const todosPage = new TodosPage(page);
        await todosPage.goto();

        const heading = page.getByRole('heading', { name: 'Dodaj zadanie' });
        expect(heading).toBeVisible();

        await page.getByRole('button', { name: 'Dodaj zadanie' }).click();
        expect(page.getByText('Tytuł jest wymagany.')).toBeVisible();

        await todosPage.addTodo('Nowe zadanie', 'Opis nowego zadania', '3');

        const list = page.getByTestId('todo-list');
        await expect(list.getByText('Nowe zadanie')).toBeVisible();
    })
})

test('verify screenshot of login page', async ({ page }) => {
    await page.goto('http://localhost:5173/#/login');

    expect(await page.screenshot({
        fullPage: true,
    })).toMatchSnapshot('login-page.png', { maxDiffPixelRatio: 0.01 });

    expect(page).toHaveScreenshot('login-page.png', { maxDiffPixelRatio: 0.01 })
})