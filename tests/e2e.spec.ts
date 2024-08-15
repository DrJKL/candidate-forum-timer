import { test as base, expect, type Page, type Locator } from '@playwright/test';

class ForumTimerPage {

    private readonly startStopButtons: Locator;
    private readonly macroModeToggle: Locator;
    private readonly nextCandidateButton: Locator;
    private readonly prevCandidateButton: Locator;
    private readonly resizeIndicator: Locator;

    private readonly nextQuestionButton: Locator;
    private readonly prevQuestionButton: Locator;

    private readonly candidateCards: Locator;

    constructor(public readonly page: Page) {
        this.startStopButtons = page.getByRole('button', { name: /^(start|stop)$/i });
        this.macroModeToggle = page.getByText(/All Candidates|Question Time/i);
        this.nextCandidateButton = page.getByRole('button', { name: /^Next/ });
        this.prevCandidateButton = page.getByRole('button', { name: /Prev$/i });
        this.resizeIndicator = page.getByText('Resizing text');
        this.nextQuestionButton = page.getByRole('button', { name: 'navigate_before', exact: true });
        this.prevQuestionButton = page.getByRole('button', { name: 'navigate_after', exact: true });

        this.candidateCards = page.locator('.candidate-card');
    }
    async goto() {
        await this.page.goto('');
    }
    async doneResizing() {
        await expect(this.resizeIndicator).toBeHidden();
    }

    async toggleNthTimer(n: number) {
        await this.startStopButtons.nth(n).click();
    }
    async useNthCandidateToken(n: number) {
        const tokenButtons = await this.nthCandidateTokenButtons(n);
        await tokenButtons.first().click();
    }
    async nthCandidateTokenButtons(n: number) {
        return this.candidateCards.nth(n).locator('.token-button');
    }
    async restoreNthCandidateToken(n: number) {
        this.candidateCards.nth(n).locator('.card-title > span:first-of-type').click({ modifiers: ["Shift"] });
    }

    async toggleMode() {
        await this.macroModeToggle.click();
    }

    async freezeClock() {
        await this.page.clock.install({ time: new Date(2012, 11, 12, 0, 0, 0) });
        await this.page.clock.pauseAt(new Date(2012, 11, 12, 0, 0, 30));
    }
    async advanceClock(millis: number) {
        await this.page.clock.runFor(millis);
    }

    async nextCandidate() {
        await this.nextCandidateButton.click();
    }
    async prevCandidate() {
        await this.prevCandidateButton.click();
    }

    async nextQuestion() {
        await this.nextQuestionButton.click();
    }
    async prevQuestion() {
        await this.prevQuestionButton.click();
    }
}
type Fixtures = {
    forumTimerPage: ForumTimerPage;
};
const test = base.extend<Fixtures>({
    forumTimerPage: async ({ page }, use) => {
        const forumTimerPage = new ForumTimerPage(page);
        await forumTimerPage.goto();
        await forumTimerPage.doneResizing();

        // Fix size of question.
        const questionHandle = page.locator('.question-wrap');
        for (const question of await questionHandle.all()) {
            await question.evaluate(questionWrapper => questionWrapper.style.setProperty('--question-size-test', '112px'));
        }
        for (const question of await questionHandle.all()) {
            await expect(question).toHaveCSS('--question-size-test', '112px');
        }

        await use(forumTimerPage);
    }
});

test('initial screenshot', async ({ page, forumTimerPage }) => {
    await expect(page).toHaveTitle('Candidate Timer');
    await expect(page).toHaveScreenshot('initial_load.png');
});

test('time stuff?', async ({ page, forumTimerPage }) => {
    await forumTimerPage.freezeClock();
    await forumTimerPage.toggleNthTimer(0);
    await expect(page).toHaveScreenshot('3_seconds_before.png');
    await forumTimerPage.advanceClock(3_000);
    await expect(page).toHaveScreenshot('3_seconds_later.png');

    await forumTimerPage.toggleNthTimer(0);
    await expect(page).toHaveScreenshot('3_seconds_later_stopped.png');

    await forumTimerPage.toggleNthTimer(1);
    await forumTimerPage.advanceClock(3_000);
    await expect(page).toHaveScreenshot('6_seconds_later.png');

    await forumTimerPage.toggleNthTimer(2);
    await forumTimerPage.advanceClock(3_000);
    await expect(page).toHaveScreenshot('9_seconds_later.png');

    await forumTimerPage.toggleNthTimer(3);
    await forumTimerPage.advanceClock(3_000);
    await expect(page).toHaveScreenshot('12_seconds_later.png');
    page.clock.resume();
});

test('Switching modes', async ({ page, forumTimerPage }) => {
    await forumTimerPage.toggleMode();
    await expect(page).toHaveScreenshot('focus_mode.png');
});

test('Changing Candidates', async ({ page, forumTimerPage }) => {
    await forumTimerPage.nextCandidate();
    await expect(page).toHaveScreenshot('switching_1.png');
    await forumTimerPage.nextCandidate();
    await expect(page).toHaveScreenshot('switching_2.png');
    await forumTimerPage.nextCandidate();
    await expect(page).toHaveScreenshot('switching_3.png');
    await forumTimerPage.nextCandidate();
    await expect(page).toHaveScreenshot('switching_4.png');
});

test('Changing questions', async ({ page, forumTimerPage }) => {
    await forumTimerPage.nextQuestion();
    await expect(page).toHaveScreenshot('switching_question_1.png');
    await forumTimerPage.nextQuestion();
    await expect(page).toHaveScreenshot('switching_question_2.png');
    await forumTimerPage.nextQuestion();
    await expect(page).toHaveScreenshot('switching_question_3.png');
});

test('Tokens', async ({ page, forumTimerPage }) => {
    await forumTimerPage.useNthCandidateToken(1);
    expect(await forumTimerPage.nthCandidateTokenButtons(1)).toHaveCount(1);
    await forumTimerPage.useNthCandidateToken(2);
    expect(await forumTimerPage.nthCandidateTokenButtons(2)).toHaveCount(1);
    await forumTimerPage.useNthCandidateToken(2);
    expect(await forumTimerPage.nthCandidateTokenButtons(2)).toHaveCount(0);
    await expect(page).toHaveScreenshot('tokens_used.png');

    // Restore token
    await forumTimerPage.restoreNthCandidateToken(2);
    expect(await forumTimerPage.nthCandidateTokenButtons(2)).toHaveCount(1);
    await expect(page).toHaveScreenshot('tokens_used_2.png');
});