import { test, expect } from '../src/fixtures/test-fixtures';
import { scanForViolations, formatViolations } from '../src/utils/accessibility';
 
test.describe('Accessibility', () => {
  test('the login page has no critical or serious WCAG 2.1 AA violations', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto();
 
    const violations = await scanForViolations(page);
 
    expect(violations, formatViolations(violations)).toEqual([]);
  });
 
  test('the product catalogue has no critical or serious WCAG 2.1 AA violations', async ({
    loggedIn,
    inventoryPage,
    page,
  }) => {
    await expect(inventoryPage.title).toHaveText('Products');
 
    const violations = await scanForViolations(page);
 
    expect(violations, formatViolations(violations)).toEqual([]);
  });
});
 