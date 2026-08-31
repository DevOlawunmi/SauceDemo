import type { Locator, Page } from '@playwright/test';

/**
 * The header is present on every authenticated page, so it lives as a component
 * that pages compose rather than being duplicated across page objects.
 */
export class HeaderComponent {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;

  constructor(private readonly page: Page) {
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.resetAppStateLink = page.locator('#reset_sidebar_link');
  }

  /** Returns 0 when the badge is absent, which is how an empty cart renders. */
  async getCartItemCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) {
      return 0;
    }
    return Number(await this.cartBadge.innerText());
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.burgerMenuButton.click();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.burgerMenuButton.click();
    await this.resetAppStateLink.click();
    await this.page.keyboard.press('Escape');
  }
}
