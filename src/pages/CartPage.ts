import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';

export class CartPage extends BasePage {
  readonly header: HeaderComponent;
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.cartItems = page.locator('.cart_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  item(productName: string): Locator {
    return this.cartItems.filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  async removeItem(productName: string): Promise<void> {
    await this.item(productName).getByRole('button', { name: 'Remove' }).click();
  }

  getItemNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  getItemPrices(): Promise<number[]> {
    return BasePage.parsePrices(this.itemPrices);
  }

  async quantityOf(productName: string): Promise<number> {
    return Number(await this.item(productName).locator('.cart_quantity').innerText());
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
