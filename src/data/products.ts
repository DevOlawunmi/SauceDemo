export const PRODUCTS = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTshirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
  redTshirt: 'Test.allTheThings() T-Shirt (Red)',
} as const;

export const EXPECTED_PRODUCT_COUNT = 6;

/** Sauce Demo applies a flat 8% sales tax to the item subtotal. */
export const TAX_RATE = 0.08;

export interface CheckoutDetails {
  readonly firstName: string;
  readonly lastName: string;
  readonly postalCode: string;
}

export const VALID_CHECKOUT_DETAILS: CheckoutDetails = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  postalCode: 'B1 1AA',
};

export const CHECKOUT_ERRORS = {
  firstNameRequired: 'Error: First Name is required',
  lastNameRequired: 'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
} as const;
