import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test'
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';

export const SORT_OPTIONS = {
  nameAsc: 'az',
  nameDesc: 'za',
  priceAsc: 'lohi',
  priceDesc: 'hilo',
} as const;

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

export class InventoryPage extends BasePage {
  readonly header: HeaderComponent;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.items = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  
  /** Scopes to a single product card so actions cannot hit the wrong item. */
  card(productName: string): Locator {
    return this.items.filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  /** Sauce Labs Backpack -> sauce-labs-backpack */
private static slug(productName: string): string {
  return productName.toLowerCase().replace(/\s+/g, '-');
}

async addToCart(productName: string): Promise<void> {
  const slug = InventoryPage.slug(productName);
  await this.page.locator(`[data-test="add-to-cart-${slug}"]`).click();
  await expect(this.page.locator(`[data-test="remove-${slug}"]`)).toBeVisible();
}

async removeFromCart(productName: string): Promise<void> {
  const slug = InventoryPage.slug(productName);
  await this.page.locator(`[data-test="remove-${slug}"]`).click();
}

  async openProduct(productName: string): Promise<void> {
    await this.itemNames.filter({ hasText: productName }).first().click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  getProductNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  getProductPrices(): Promise<number[]> {
    return BasePage.parsePrices(this.itemPrices);
  }

  async getPriceOf(productName: string): Promise<number> {
    const text = await this.card(productName).locator('.inventory_item_price').innerText();
    return BasePage.parsePrice(text);
  }
}
