export interface User {
  readonly username: string;
  readonly password: string;
  readonly description: string;
}

/**
 * Sauce Demo publishes these credentials on its own login page, so they are
 * safe to commit. Both values are still read from the environment first so the
 * same suite can be pointed at a protected environment without a code change.
 */
const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const USERS = {
  standard: {
    username: process.env.SAUCE_USERNAME ?? 'standard_user',
    password: PASSWORD,
    description: 'Baseline account with no injected defects',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: PASSWORD,
    description: 'Account disabled at login',
  },
  problem: {
    username: 'problem_user',
    password: PASSWORD,
    description: 'Account with deliberately broken images and form fields',
  },
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: PASSWORD,
    description: 'Account with artificially slow page loads',
  },
} as const satisfies Record<string, User>;

export const INVALID_USER: User = {
  username: 'not_a_real_user',
  password: 'wrong_password',
  description: 'Credentials that do not exist',
};

export const LOGIN_ERRORS = {
  invalidCredentials:
    'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
} as const;
