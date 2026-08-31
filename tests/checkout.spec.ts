import { test, expect } from '../src/fixtures/test-fixtures';
import {
  PRODUCTS,
  TAX_RATE,
  VALID_CHECKOUT_DETAILS,
  CHECKOUT_ERRORS,
} from '../src/data/products';

test.describe('Checkout', () => {
  test('a customer can complete an order end to end', async ({
    loggedIn,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
    page,
  }) => {
    const chosen = [PRODUCTS.backpack, PRODUCTS.fleeceJacket];

    await test.step('add products to the cart', async () => {
      for (const product of chosen) {
        await inventoryPage.addToCart(product);
      }
      await expect(inventoryPage.header.cartBadge).toHaveText(String(chosen.length));
    });

    await test.step('submit customer details', async () => {
      await inventoryPage.header.openCart();
      await cartPage.proceedToCheckout();
      await expect(checkoutInformationPage.title).toHaveText('Checkout: Your Information');
      await checkoutInformationPage.submit(VALID_CHECKOUT_DETAILS);
    });

    await test.step('the overview shows the right items and the right money', async () => {
      await expect(checkoutOverviewPage.title).toHaveText('Checkout: Overview');
      await expect(checkoutOverviewPage.cartItems).toHaveCount(chosen.length);
      expect(await checkoutOverviewPage.getItemNames()).toEqual(expect.arrayContaining(chosen));

      const prices = await checkoutOverviewPage.getItemPrices();
      const expectedSubtotal = prices.reduce((sum, price) => sum + price, 0);
      const { subtotal, tax, total } = await checkoutOverviewPage.getTotals();

      expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(tax).toBeCloseTo(Number((expectedSubtotal * TAX_RATE).toFixed(2)), 2);
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });

    await test.step('confirm the order', async () => {
      await checkoutOverviewPage.finish();
      await expect(page).toHaveURL(/checkout-complete\.html$/);
      await expect(checkoutCompletePage.confirmationHeader).toHaveText(
        'Thank you for your order!',
      );
      await expect(checkoutCompletePage.ponyExpressImage).toBeVisible();
    });

    await test.step('the cart is emptied once the order is placed', async () => {
      await expect(checkoutCompletePage.header.cartBadge).toHaveCount(0);
      await checkoutCompletePage.backToProducts();
      await expect(inventoryPage.title).toHaveText('Products');
      await expect(inventoryPage.header.cartBadge).toHaveCount(0);
    });
  });

  test.describe('customer details validation', () => {
    test.beforeEach(async ({ loggedIn, inventoryPage, cartPage }) => {
      await inventoryPage.addToCart(PRODUCTS.bikeLight);
      await inventoryPage.header.openCart();
      await cartPage.proceedToCheckout();
    });

    const missingFieldCases = [
      {
        label: 'first name',
        details: { firstName: '', lastName: 'Lovelace', postalCode: 'B1 1AA' },
        error: CHECKOUT_ERRORS.firstNameRequired,
      },
      {
        label: 'last name',
        details: { firstName: 'Ada', lastName: '', postalCode: 'B1 1AA' },
        error: CHECKOUT_ERRORS.lastNameRequired,
      },
      {
        label: 'postal code',
        details: { firstName: 'Ada', lastName: 'Lovelace', postalCode: '' },
        error: CHECKOUT_ERRORS.postalCodeRequired,
      },
    ];

    for (const { label, details, error } of missingFieldCases) {
      test(`a missing ${label} blocks progress to the overview`, async ({
        checkoutInformationPage,
        page,
      }) => {
        await checkoutInformationPage.submit(details);

        await expect(checkoutInformationPage.errorMessage).toHaveText(error);
        await expect(page).toHaveURL(/checkout-step-one\.html$/);
      });
    }
  });

  test('cancelling from the overview returns to the catalogue with the cart intact', async ({
    loggedIn,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    await inventoryPage.addToCart(PRODUCTS.onesie);
    await inventoryPage.header.openCart();
    await cartPage.proceedToCheckout();
    await checkoutInformationPage.submit(VALID_CHECKOUT_DETAILS);
    await expect(checkoutOverviewPage.title).toHaveText('Checkout: Overview');

    await checkoutOverviewPage.cancelButton.click();

    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });
});
