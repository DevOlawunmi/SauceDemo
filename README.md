# Sauce Demo — End-to-End Test Suite

An end-to-end automation project for [saucedemo.com](https://www.saucedemo.com/), built with **Playwright** and **TypeScript** using the Page Object Model.

20 tests across 4 specs, running on Chromium, Firefox and WebKit.

---

## Setup

**Prerequisites:** Node.js 18 or later.

```bash
git clone https://github.com/<your-username>/saucedemo-playwright.git
cd saucedemo-playwright
npm ci
npx playwright install
```

`npx playwright install` downloads the browser binaries and is only needed once.

## Running the tests

```bash
npm test                  # all tests, all three browsers, headless
npm run test:chromium     # a single browser — fastest feedback loop
npm run test:headed       # watch the browser as it runs
npm run test:ui           # Playwright UI mode: time travel and pick locators
npm run test:debug        # step through with the inspector
npm run report            # open the HTML report from the last run
npm run typecheck         # tsc --noEmit, no browsers required
```

Target a different environment without touching the code:

```bash
BASE_URL=https://staging.example.com npm test
```

Run one file, or one test by name:

```bash
npx playwright test tests/checkout.spec.ts
npx playwright test -g "complete an order end to end"
```

## Project structure

```
├── playwright.config.ts          # browsers, timeouts, reporters, baseURL
├── src
│   ├── data
│   │   ├── users.ts              # accounts and expected error copy
│   │   └── products.ts           # catalogue names, tax rate, checkout data
│   ├── fixtures
│   │   └── test-fixtures.ts      # page objects + authenticated session fixture
│   └── pages
│       ├── BasePage.ts           # shared helpers (price parsing, page title)
│       ├── LoginPage.ts
│       ├── InventoryPage.ts
│       ├── CartPage.ts
│       ├── CheckoutInformationPage.ts
│       ├── CheckoutOverviewPage.ts
│       ├── CheckoutCompletePage.ts
│       └── components
│           └── HeaderComponent.ts  # cart badge, cart link, burger menu
└── tests
    ├── login.spec.ts             # authentication and session
    ├── cart.spec.ts              # add, remove, persist
    ├── inventory-sorting.spec.ts # catalogue and sort order
    └── checkout.spec.ts          # full purchase journey and validation
```

## What is covered and why

The site is a storefront, so coverage follows the revenue path — a defect anywhere along it stops a customer buying.

| Spec | Tests | Why it is critical |
|---|---|---|
| `login.spec.ts` | 5 | The gate to everything else. Covers the happy path, wrong password, the locked-out account, empty-field validation, and — the one that actually matters for security — that `/inventory.html` is unreachable by URL after logout. |
| `cart.spec.ts` | 5 | The cart is the state the whole purchase depends on. Asserts the badge count, that the right product and price carry through, removal from both the catalogue and the cart, and that contents survive navigation. |
| `inventory-sorting.spec.ts` | 5 | Sorting is the most logic-heavy client-side feature and the easiest to break silently. Prices are parsed to numbers and compared against a locally sorted copy rather than a hardcoded list, so the assertion still holds if the catalogue changes. |
| `checkout.spec.ts` | 5 | The end-to-end money path. Recalculates subtotal from the line items, verifies tax at 8% and that total equals subtotal plus tax, confirms the order, and checks the cart is emptied afterwards. Plus data-driven validation for each required field. |

### Notes on the approach

**Page Object Model with a component for the header.** The header appears on every authenticated page, so it is composed into the page objects rather than copy-pasted into each one.

**Fixtures over `beforeEach` login.** A `loggedIn` fixture handles authentication and asserts it succeeded, so a broken login fails fast and clearly instead of surfacing as a confusing failure three steps into a cart test. Login tests simply don't request the fixture.

**`testIdAttribute` is set to `data-test`.** Sauce Demo ships `data-test` attributes, so `getByTestId()` maps onto them directly and the tests stay off brittle CSS chains.

**Assertions describe behaviour, not the DOM.** Totals are recalculated from line items, sort order is checked against a sorted copy of the actual data, and cart state is verified through the badge, the list and the quantity. `expect(await ...)` is only used where a value must be computed; everywhere else uses Playwright's auto-retrying web-first assertions, so there are no hardcoded waits anywhere in the suite.

**Tests are independent and parallel-safe.** `fullyParallel` is on, no test depends on another's state, and the `loggedIn` fixture clears `localStorage` on teardown so a cart cannot leak between tests.

**CI.** `.github/workflows/playwright.yml` runs the type check and the full suite on every push and pull request, uploading the HTML report as an artifact. Retries are enabled on CI only — locally a flake should be visible, not hidden.

## To Do — with more time

- **Visual regression** on the catalogue and checkout pages via `toHaveScreenshot()`, which would catch the broken-image defects `problem_user` exhibits.
- **Accessibility checks** with `@axe-core/playwright` on each page, gated at zero serious or critical violations.
- **`problem_user` and `performance_glitch_user` coverage.** These accounts have deliberately injected defects; I would assert the known failures explicitly so the suite documents them, and use `performance_glitch_user` to set a page-load budget.
- **Authenticate via API and reuse `storageState`** so only the login spec goes through the form. On a real app this cuts several seconds off every test.
- **Data-driven login** across all six published accounts, table-driven from `users.ts`.
- **Product detail page coverage** — navigating in from the catalogue, adding from the detail page, and the back-to-products path.
- **Cross-cutting checks** — no console errors during the happy path, and no failed network requests, asserted in an `afterEach`.
- **Lint and format** with ESLint (`eslint-plugin-playwright`) and Prettier, wired into CI and a pre-commit hook.
- **Reporting** — Allure or a merged blob report across shards, with the suite sharded in CI once the runtime justifies it.
- **Test data isolation.** Sauce Demo is a shared public sandbox with a fixed catalogue; against a real environment I would seed and tear down data per test rather than relying on fixed fixtures.

## Known constraints

- Sauce Demo has no back end to reset, so cart state is cleared through the UI and `localStorage` rather than an API.
- The published credentials are committed deliberately — they are printed on the site's own login page. Both username and password are still read from `SAUCE_USERNAME` / `SAUCE_PASSWORD` if set, so nothing needs changing to point this at a protected environment.
