import { Page } from "@playwright/test";

export class LoginPage {
    private passwordInput;
    private loginButton;

    constructor(private page: Page) {
        this.passwordInput = page.getByLabel('Hasło');
        this.loginButton = page.getByRole('button', { name: 'Zaloguj' });
    }

    async login(password: string) {
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}