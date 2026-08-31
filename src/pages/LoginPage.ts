/**import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { User } from '../data/users';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
    this.errorCloseButton = page.locator('.error-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAs(user: User): Promise<void> {
    await this.login(user.username, user.password);
  }

  // Field-level styling Sauce Demo applies when a submission is rejected. 
  inputErrorIcon(field: 'username' | 'password'): Locator {
    return this.page.locator(`#${field === 'username' ? 'user-name' : 'password'} + svg`);
  }
}
*/

import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { User } from '../data/users';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
    this.errorCloseButton = page.locator('.error-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com/');
    await this.expectFormReady();
  }

  /**
   * These locators resolve through `testIdAttribute: 'data-test'` in
   * playwright.config.ts. If that config is not loaded — usually because the
   * runner was started from outside the project root — getByTestId falls back
   * to `data-testid`, which Sauce Demo does not use, and every action times out
   * with no indication of the cause. Failing here names it instead.
   */
  private async expectFormReady(): Promise<void> {
    await expect(
      this.usernameInput,
      'Login form not found. If this page loaded, check that playwright.config.ts ' +
        'is being picked up and sets testIdAttribute to "data-test".',
    ).toBeVisible({ timeout: 5_000 });
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAs(user: User): Promise<void> {
    await this.login(user.username, user.password);
  }

  /** Field-level styling Sauce Demo applies when a submission is rejected. */
  inputErrorIcon(field: 'username' | 'password'): Locator {
    return this.page.locator(`#${field === 'username' ? 'user-name' : 'password'} + svg`);
  }
}