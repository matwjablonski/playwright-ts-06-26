import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://mateuszjablonski.com/');
  await page.getByRole('link', { name: 'Zobacz bezpłatne materiały' }).click();
  await page.getByRole('textbox', { name: 'Podaj adres e-mail' }).click();
  await page.getByRole('textbox', { name: 'Podaj adres e-mail' }).fill('exapmel');
  await page.locator('div').filter({ hasText: 'Dołącz do newslettera i bądź' }).nth(3).click();
  await page.getByRole('button', { name: 'Zapisz mnie do newslettera' }).click();
  await page.getByRole('button', { name: 'Zapisz mnie do newslettera' }).click();
  await page.getByText('Podany email jest błędny lub')
});