import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.page';

const authPath = '.auth/user.json';

setup('authentication', async ({ page }) => {
    await page.goto('http://localhost:5173/#/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('admin123');

    await page.context().storageState({ path: authPath });

})