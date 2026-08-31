import { test, expect } from '../src/fixtures/test-fixtures';
import { PRODUCTS } from '../src/data/products';

test.describe('Shopping cart', () => {
  test('adding a product updates the badge and carries the correct name and price', async ({
    loggedIn,
    inventoryPage,
    cartPage,
  }) => {
    const expectedPrice = await inventoryPage.getPriceOf(PRODUCTS.backpack);

    await inventoryPage.addToCart(PRODUCTS.backpack);
    await expect(inventoryPage.header.cartBadge).toHaveText('1');

    await inventoryPage.header.openCart();
    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.item(PRODUCTS.backpack)).toBeVisible();
    expect(await cartPage.getItemPrices()).toEqual([expectedPrice]);
    expect(await cartPage.quantityOf(PRODUCTS.backpack)).toBe(1);
  });

  test('multiple products accumulate in the cart', async ({
    loggedIn,
    inventoryPage,
    cartPage,
  }) => {
    const chosen = [PRODUCTS.backpack, PRODUCTS.bikeLight, PRODUCTS.onesie];

    for (const product of chosen) {
      await inventoryPage.addToCart(product);
    }
    await expect(inventoryPage.header.cartBadge).toHaveText('3');

    await inventoryPage.header.openCart();
    await expect(cartPage.cartItems).toHaveCount(chosen.length);
    expect(await cartPage.getItemNames()).toEqual(expect.arrayContaining(chosen));
  });

  test('removing a product from the cart page updates the badge and the list', async ({
    loggedIn,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.fleeceJacket);
    await inventoryPage.header.openCart();

    await cartPage.removeItem(PRODUCTS.backpack);

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.item(PRODUCTS.backpack)).toHaveCount(0);
    await expect(cartPage.item(PRODUCTS.fleeceJacket)).toBeVisible();
    await expect(cartPage.header.cartBadge).toHaveText('1');
  });

  test('emptying the cart removes the badge entirely', async ({
    loggedIn,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(PRODUCTS.boltTshirt);
    await inventoryPage.removeFromCart(PRODUCTS.boltTshirt);

    await expect(inventoryPage.header.cartBadge).toHaveCount(0);
    expect(await inventoryPage.header.getCartItemCount()).toBe(0);

    await inventoryPage.header.openCart();
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.checkoutButton).toBeVisible();
  });

  test('cart contents survive navigating away and back', async ({
    loggedIn,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(PRODUCTS.redTshirt);
    await inventoryPage.header.openCart();
    await cartPage.continueShoppingButton.click();

    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
    await expect(
      inventoryPage.card(PRODUCTS.redTshirt).getByRole('button', { name: 'Remove' }),
    ).toBeVisible();
  });
});
