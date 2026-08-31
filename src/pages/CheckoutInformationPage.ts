import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { CheckoutDetails } from '../data/products';

export class CheckoutInformationPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.errorMessage = page.getByTestId('error');
  }

  async fillDetails(details: Partial<CheckoutDetails>): Promise<void> {
    await this.firstNameInput.fill(details.firstName ?? '');
    await this.lastNameInput.fill(details.lastName ?? '');
    await this.postalCodeInput.fill(details.postalCode ?? '');
  }

  async submit(details: Partial<CheckoutDetails>): Promise<void> {
    await this.fillDetails(details);
    await this.continueButton.click();
  }
}
