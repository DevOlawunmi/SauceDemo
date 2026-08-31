# Sauce Demo — End-to-End Test Suite

An end-to-end automation project for [saucedemo.com](https://www.saucedemo.com/), built with **Playwright** and **TypeScript** using the Page Object Model.

22 tests across 5 specs, running on Chromium, Firefox and WebKit.

---

## Setup

**Prerequisites:** Node.js 20 or later.

```bash
git clone https://github.com/DevOlawunmi/SauceDemo/tree/dev
cd saucedemo-playwright
npm ci
npx playwright install
```

`npx playwright install` downloads the browser binaries and is only needed once. `npm ci` installs `@axe-core/playwright` alongside Playwright, which the accessibility spec requires.

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

Every run writes an HTML report to `playwright-report/`, including traces, screenshots and video for any failure. Open it with `npm run report` — the terminal output is only a summary, and the report is where you can step through a failing test.

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
│   ├── utils
│   │   └── accessibility.ts      # axe scan helper, impact gating, baseline list
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
    ├── checkout.spec.ts          # full purchase journey and validation
    └── accessibility.spec.ts     # automated WCAG 2.1 AA scan
```

## What is covered and why

The site is a storefront, so coverage follows the revenue path — a defect anywhere along it stops a customer buying.

| Spec | Tests | Why it is critical |
|---|---|---|
| `login.spec.ts` | 5 | The gate to everything else. Covers the happy path, wrong password, the locked-out account, empty-field validation, and — the one that actually matters for security — that `/inventory.html` is unreachable by URL after logout. |
| `cart.spec.ts` | 5 | The cart is the state the whole purchase depends on. Asserts the badge count, that the right product and price carry through, removal from both the catalogue and the cart, and that contents survive navigation. |
| `inventory-sorting.spec.ts` | 5 | Sorting is the most logic-heavy client-side feature and the easiest to break silently. Prices are parsed to numbers and compared against a locally sorted copy rather than a hardcoded list, so the assertion still holds if the catalogue changes. |
| `accessibility.spec.ts` | 2 | Automated WCAG 2.1 A/AA scan of the login page and the catalogue via axe-core, gated at critical and serious impacts only. See Findings below. |
| `checkout.spec.ts` | 5 | The end-to-end money path. Recalculates subtotal from the line items, verifies tax at 8% and that total equals subtotal plus tax, confirms the order, and checks the cart is emptied afterwards. Plus data-driven validation for each required field. |

### Notes on the approach

**Page Object Model with a component for the header.** The header appears on every authenticated page, so it is composed into the page objects rather than copy-pasted into each one.

**Fixtures over `beforeEach` login.** A `loggedIn` fixture handles authentication and asserts it succeeded, so a broken login fails fast and clearly instead of surfacing as a confusing failure three steps into a cart test. Login tests simply don't request the fixture.

**`testIdAttribute` is set to `data-test`.** Sauce Demo ships `data-test` attributes, so `getByTestId()` maps onto them directly and the tests stay off brittle CSS chains.

**Assertions describe behaviour, not the DOM.** Totals are recalculated from line items, sort order is checked against a sorted copy of the actual data, and cart state is verified through the badge, the list and the quantity. `expect(await ...)` is only used where a value must be computed; everywhere else uses Playwright's auto-retrying web-first assertions, so there are no hardcoded waits anywhere in the suite.

**Tests are independent and parallel-safe.** `fullyParallel` is on, no test depends on another's state, and the `loggedIn` fixture clears `localStorage` on teardown so a cart cannot leak between tests.

**Accessibility is gated, not absolute.** The scan fails the build on critical and serious violations only; minor and moderate findings are reported but do not block. A gate nobody can keep green gets deleted, so the threshold is set where the failures are worth acting on. Rules already known to fail are listed in `KNOWN_VIOLATIONS` in `src/utils/accessibility.ts` with a reason against each, so the suite catches new regressions rather than re-reporting accepted issues. Failures print the rule, the affected selectors and a link to the fix rather than an array diff.

**CI.** `.github/workflows/playwright.yml` runs the type check and the full suite on every push and pull request, uploading the HTML report as an artifact. Retries are enabled on CI only — locally a flake should be visible, not hidden.

## Findings

The accessibility spec surfaced a real defect in the application under test.

**Product sort dropdown has no accessible name** — `select-name`, impact **critical**, WCAG 2.1 4.1.2 (Name, Role, Value).

The `<select class="product_sort_container">` on `/inventory.html` has a `data-test` attribute but no `<label>`, `aria-label`, `aria-labelledby` or `title`. A sighted user infers the control's purpose from its options; a screen-reader user hears a combo box with no indication that it sorts the catalogue. The fix is a single attribute:

```html
<select aria-label="Sort products" class="product_sort_container" ...>
```

The catalogue test is marked `test.fail()` rather than suppressed via `KNOWN_VIOLATIONS`. Playwright reports an expected failure as passing, and **fails the build if the test ever starts passing** — so the day the attribute is added, the suite flags the annotation for removal. That is a more precise statement than disabling the rule globally, which would also mask the same defect appearing on any other page.

The login page passes the same scan cleanly.

## To Do — with more time

- **Visual regression** on the catalogue and checkout pages via `toHaveScreenshot()`, which would catch the broken-image defects `problem_user` exhibits.
- **Extend accessibility coverage** to the cart and checkout pages, where form labelling and error announcement matter most, and add keyboard-only journey tests — axe catches static markup issues but not whether a user can complete a purchase with Tab and Enter alone.
- **`problem_user` and `performance_glitch_user` coverage.** These accounts have deliberately injected defects; I would assert the known failures explicitly so the suite documents them, and use `performance_glitch_user` to set a page-load budget.
- **Authenticate via API and reuse `storageState`** so only the login spec goes through the form. On a real app this cuts several seconds off every test.
- **Data-driven login** across all six published accounts, table-driven from `users.ts`.
- **Product detail page coverage** — navigating in from the catalogue, adding from the detail page, and the back-to-products path.
- **Cross-cutting checks** — no console errors during the happy path, and no failed network requests, asserted in an `afterEach`.
- **Lint and format** with ESLint (`eslint-plugin-playwright`) and Prettier, wired into CI and a pre-commit hook.
- **Reporting.** The built-in HTML reporter is sufficient at this size and is already uploaded as a CI artifact. On a larger suite I would move to Allure for run history and failure categorisation, and shard across CI jobs with merged blob reports once wall-clock runtime justifies the coordination cost.
- **Test data isolation.** Sauce Demo is a shared public sandbox with a fixed catalogue; against a real environment I would seed and tear down data per test rather than relying on fixed fixtures.

## Known constraints

- Sauce Demo has no back end to reset, so cart state is cleared through the UI and `localStorage` rather than an API.
- The published credentials are committed deliberately — they are printed on the site's own login page. Both username and password are still read from `SAUCE_USERNAME` / `SAUCE_PASSWORD` if set, so nothing needs changing to point this at a protected environment.