// e2e/tests/auth.e2e.ts
// Authentication E2E tests

import {
  waitForElementAndTap,
  typeInField,
  verifyTextDisplayed,
  waitForScreen,
  takeScreenshot,
  dismissKeyboard
} from '../helpers';

describe('Authentication Flow', () => {
  describe('Login', () => {
    it('should display login screen on app start', async () => {
      await waitForScreen('Login', 5000);
      await takeScreenshot('login-screen');
    });

    it('should show validation error for empty credentials', async () => {
      // Try to login without entering credentials
      await waitForElementAndTap('loginButton');
      
      // Should show error messages
      await verifyTextDisplayed('Please enter email');
      await takeScreenshot('login-validation-error');
    });

    it('should show error for invalid credentials', async () => {
      await typeInField('emailInput', 'invalid@test.com');
      await typeInField('passwordInput', 'wrongpassword');
      await dismissKeyboard();
      
      await waitForElementAndTap('loginButton');
      
      // Should show error
      await waitFor(element(by.text('Invalid credentials')))
        .toBeVisible()
        .withTimeout(5000);
      
      await takeScreenshot('login-invalid-credentials');
    });

    it('should successfully login with valid credentials', async () => {
      // Clear previous entries
      await element(by.id('emailInput')).clearText();
      await element(by.id('passwordInput')).clearText();
      
      // Enter valid credentials
      await typeInField('emailInput', 'test@example.com');
      await typeInField('passwordInput', 'ValidPassword123');
      await dismissKeyboard();
      
      await waitForElementAndTap('loginButton');
      
      // Should navigate to dashboard
      await waitForScreen('Dashboard', 10000);
      await takeScreenshot('login-success');
    });

    it('should persist login state after app restart', async () => {
      // Already logged in from previous test
      await waitForScreen('Dashboard', 5000);
      
      // Reload app
      await device.reloadReactNative();
      
      // Should still be on dashboard (session persisted)
      await waitForScreen('Dashboard', 5000);
      await takeScreenshot('login-persist');
    });
  });

  describe('Logout', () => {
    beforeEach(async () => {
      // Ensure user is logged in
      await waitForScreen('Dashboard', 5000);
    });

    it('should logout successfully', async () => {
      // Navigate to profile/settings
      await waitForElementAndTap('profileButton');
      await waitForScreen('Profile', 5000);
      
      // Tap logout
      await waitForElementAndTap('logoutButton');
      
      // Should be back at login screen
      await waitForScreen('Login', 5000);
      await takeScreenshot('logout-success');
    });

    it('should clear session data after logout', async () => {
      // Already logged out from previous test
      await waitForScreen('Login', 5000);
      
      // Reload app
      await device.reloadReactNative();
      
      // Should still show login screen
      await waitForScreen('Login', 5000);
      await takeScreenshot('logout-persist');
    });
  });

  describe('Sign Up', () => {
    beforeEach(async () => {
      await waitForScreen('Login', 5000);
    });

    it('should navigate to signup screen', async () => {
      await waitForElementAndTap('signupLink');
      await waitForScreen('Sign Up', 5000);
      await takeScreenshot('signup-screen');
    });

    it('should show validation errors for empty fields', async () => {
      await waitForElementAndTap('signupLink');
      await waitForScreen('Sign Up', 5000);
      
      await waitForElementAndTap('signupButton');
      
      await verifyTextDisplayed('Please enter email');
      await takeScreenshot('signup-validation');
    });

    it('should successfully create new account', async () => {
      await waitForElementAndTap('signupLink');
      await waitForScreen('Sign Up', 5000);
      
      const timestamp = Date.now();
      await typeInField('fullnameInput', 'Test User');
      await typeInField('emailInput', `testuser${timestamp}@example.com`);
      await typeInField('passwordInput', 'SecurePassword123');
      await typeInField('confirmPasswordInput', 'SecurePassword123');
      await dismissKeyboard();
      
      await waitForElementAndTap('signupButton');
      
      // Should show success or navigate to next screen
      await waitForScreen('Dashboard', 10000);
      await takeScreenshot('signup-success');
    });
  });
});
