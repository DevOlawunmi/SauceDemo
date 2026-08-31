import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';

export class CheckoutCompletePage extends BasePage {
  readonly header: HeaderComponent;
  readonly confirmationHeader: Locator;
  readonly confirmationText: Locator;
  readonly ponyExpressImage: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.confirmationHeader = page.locator('.complete-header');
    this.confirmationText = page.locator('.complete-text');
    this.ponyExpressImage = page.locator('.pony_express');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async backToProducts(): Promise<void> {
    await this.backHomeButton.click();
  }
}
