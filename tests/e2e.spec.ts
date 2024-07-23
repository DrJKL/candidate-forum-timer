import { test, expect } from '@playwright/test';

test('initial screenshot', async ({ page }) => {
    await page.goto('');
    await expect(page).toHaveTitle('Candidate Timer');
    await expect(page).toHaveScreenshot('initial_load.png');
});

test('time stuff?', async ({ page }) => {
    await page.clock.install({time: new Date(2012, 11, 12, 0, 0, 0)});
    await page.goto('');
    await page.clock.pauseAt(new Date(2012, 11, 12, 0, 0, 30));

    await page.getByRole('button', {name: /start/i}).first().click();
    await page.clock.runFor(3_000);
    await expect(page).toHaveScreenshot('3_seconds_later.png');
    await page.getByRole('button', {name: /stop/i}).first().click();
    await expect(page).toHaveScreenshot('3_seconds_later_stopped.png');

    await page.getByRole('button', {name: /start/i}).nth(1).click();
    await page.clock.runFor(3_000);
    await expect(page).toHaveScreenshot('6_seconds_later.png');

    await page.getByRole('button', {name: /start/i}).nth(1).click();
    await page.clock.runFor(3_000);
    await expect(page).toHaveScreenshot('9_seconds_later.png');

    await page.getByRole('button', {name: /start/i}).nth(1).click();
    await page.clock.runFor(3_000);
    await expect(page).toHaveScreenshot('12_seconds_later.png');

});
