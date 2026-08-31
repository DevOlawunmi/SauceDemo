import { test, expect } from '../src/fixtures/test-fixtures';
import { SORT_OPTIONS } from '../src/pages/InventoryPage';
import { EXPECTED_PRODUCT_COUNT } from '../src/data/products';

test.describe('Product sorting', () => {
  test('the catalogue renders every product with a name and a price', async ({
    loggedIn,
    inventoryPage,
  }) => {
    await expect(inventoryPage.items).toHaveCount(EXPECTED_PRODUCT_COUNT);
    await expect(inventoryPage.itemNames).toHaveCount(EXPECTED_PRODUCT_COUNT);

    const prices = await inventoryPage.getProductPrices();
    expect(prices).toHaveLength(EXPECTED_PRODUCT_COUNT);
    expect(prices.every((price) => price > 0)).toBe(true);
  });

  test('price low to high returns an ascending list', async ({ loggedIn, inventoryPage }) => {
    await inventoryPage.sortBy(SORT_OPTIONS.priceAsc);

    const prices = await inventoryPage.getProductPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('price high to low returns a descending list', async ({ loggedIn, inventoryPage }) => {
    await inventoryPage.sortBy(SORT_OPTIONS.priceDesc);

    const prices = await inventoryPage.getProductPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('name A to Z and Z to A are exact mirrors of each other', async ({
    loggedIn,
    inventoryPage,
  }) => {
    await inventoryPage.sortBy(SORT_OPTIONS.nameAsc);
    const ascending = await inventoryPage.getProductNames();
    expect(ascending).toEqual([...ascending].sort((a, b) => a.localeCompare(b)));

    await inventoryPage.sortBy(SORT_OPTIONS.nameDesc);
    const descending = await inventoryPage.getProductNames();
    expect(descending).toEqual([...ascending].reverse());
  });

  test('sorting reorders the catalogue without adding or losing products', async ({
    loggedIn,
    inventoryPage,
  }) => {
    const original = await inventoryPage.getProductNames();

    await inventoryPage.sortBy(SORT_OPTIONS.priceDesc);
    const sorted = await inventoryPage.getProductNames();

    expect(sorted).toHaveLength(original.length);
    expect([...sorted].sort()).toEqual([...original].sort());
  });
});
