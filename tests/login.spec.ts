import { test, expect } from '../src/fixtures/test-fixtures';
import { USERS, INVALID_USER, LOGIN_ERRORS } from '../src/data/users';
import { EXPECTED_PRODUCT_COUNT } from '../src/data/products';

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('a valid user can log in and reach the product catalogue', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.loginAs(USERS.standard);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(EXPECTED_PRODUCT_COUNT);
    await expect(inventoryPage.header.cartLink).toBeVisible();
  });

  test('an incorrect password is rejected without revealing which field failed', async ({
    loginPage,
    page,
  }) => {
    await loginPage.login(USERS.standard.username, INVALID_USER.password);

    await expect(loginPage.errorMessage).toHaveText(LOGIN_ERRORS.invalidCredentials);
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('a locked out user is refused access with a specific message', async ({
    loginPage,
    page,
  }) => {
    await loginPage.loginAs(USERS.lockedOut);

    await expect(loginPage.errorMessage).toHaveText(LOGIN_ERRORS.lockedOut);
    await expect(page).not.toHaveURL(/inventory/);
  });

  test('the form blocks submission when required fields are empty', async ({ loginPage }) => {
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toHaveText(LOGIN_ERRORS.usernameRequired);

    await loginPage.errorCloseButton.click();
    await expect(loginPage.errorMessage).toBeHidden();

    await loginPage.login(USERS.standard.username, '');
    await expect(loginPage.errorMessage).toHaveText(LOGIN_ERRORS.passwordRequired);
  });

  test('logging out ends the session and protected pages cannot be reached directly', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.loginAs(USERS.standard);
    await expect(inventoryPage.title).toHaveText('Products');

    await inventoryPage.header.logout();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.loginButton).toBeVisible();

    /* The security case that matters: the catalogue must not be reachable
       by URL once the session has ended. */
    await inventoryPage.goto();
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).not.toHaveURL(/inventory/);
  });
});
