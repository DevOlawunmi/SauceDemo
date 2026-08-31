import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface OrderTotals {
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
}

export class CheckoutOverviewPage extends BasePage {
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('.cart_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  getItemNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  getItemPrices(): Promise<number[]> {
    return BasePage.parsePrices(this.itemPrices);
  }

  /** Reads the money summary so tests can assert the arithmetic, not just the text. */
  async getTotals(): Promise<OrderTotals> {
    const [subtotal, tax, total] = await Promise.all([
      this.subtotalLabel.innerText(),
      this.taxLabel.innerText(),
      this.totalLabel.innerText(),
    ]);

    return {
      subtotal: BasePage.parsePrice(subtotal),
      tax: BasePage.parsePrice(tax),
      total: BasePage.parsePrice(total),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
