import type { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  /** Page heading, e.g. "Products", "Your Cart", "Checkout: Overview". */
  get title(): Locator {
    return this.page.locator('.title');
  }

  /** Converts a displayed price such as "$29.99" into 29.99. */
  protected static parsePrice(raw: string | null): number {
    const value = Number((raw ?? '').replace(/[^0-9.]/g, ''));
    if (Number.isNaN(value)) {
      throw new Error(`Unable to parse a price from "${raw}"`);
    }
    return value;
  }

  protected static async parsePrices(locator: Locator): Promise<number[]> {
    const raw = await locator.allTextContents();
    return raw.map((text) => BasePage.parsePrice(text));
  }
}
