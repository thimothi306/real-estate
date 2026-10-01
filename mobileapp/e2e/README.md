# Mobile App E2E Testing Guide

## Overview

This directory contains end-to-end (E2E) tests for the Kavuri Estates mobile application using **Detox**, a purpose-built testing framework for React Native and Expo applications.

## Setup

### Prerequisites

- Node.js and npm installed
- iOS development tools (Xcode) for iOS testing
- Android Studio or Android SDK for Android testing
- Detox CLI: `npm install -g detox-cli`

### Installation

All dependencies are already installed. The packages include:
- `detox` - Testing framework
- `detox-cli` - Command-line interface

## Running Tests

### Quick Start

#### iOS Simulator

```bash
# Build the app for testing
npm run test:e2e:build

# Run tests
npm run test:e2e
```

#### Android Emulator

```bash
# Build the app for testing
npm run test:e2e:build:android

# Run tests
npm run test:e2e:android
```

### Detailed Commands

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run E2E tests on iOS simulator |
| `npm run test:e2e:android` | Run E2E tests on Android emulator |
| `npm run test:e2e:build` | Build app for iOS testing |
| `npm run test:e2e:build:android` | Build app for Android testing |
| `npm run test:e2e:debug` | Run tests with detailed logging |
| `npm run test:e2e:report` | Generate test report |

## Test Structure

### Directory Layout

```
e2e/
├── init.ts              # Detox initialization
├── config.ts            # Test configuration and test data
├── config.json          # Jest configuration
├── helpers/
│   └── index.ts         # Helper functions for common actions
└── tests/
    ├── auth.e2e.ts      # Authentication tests
    ├── dashboard.e2e.ts # Dashboard and navigation tests
    └── notifications.e2e.ts # Notification handling tests
```

## Test Files

### 1. Authentication Tests (`auth.e2e.ts`)

Tests for user authentication flows:

- **Login Flow**
  - Display login screen on app start
  - Validation errors for empty credentials
  - Invalid credentials error handling
  - Successful login with valid credentials
  - Session persistence after app restart

- **Logout Flow**
  - Successful logout
  - Session data cleared after logout

- **Sign Up Flow**
  - Navigate to signup screen
  - Validation errors for empty fields
  - Successful account creation

**Example:** Test valid login
```typescript
it('should successfully login with valid credentials', async () => {
  await typeInField('emailInput', 'test@example.com');
  await typeInField('passwordInput', 'ValidPassword123');
  await dismissKeyboard();
  
  await waitForElementAndTap('loginButton');
  
  await waitForScreen('Dashboard', 10000);
  await takeScreenshot('login-success');
});
```

### 2. Dashboard Tests (`dashboard.e2e.ts`)

Tests for dashboard functionality:

- **Navigation**
  - Display dashboard on login
  - Navigation menu visibility
  - Tab navigation (Properties, Favorites, Profile)

- **Properties Listing**
  - Display properties list
  - Load more properties on scroll
  - Open property details
  - Add property to favorites
  - Filter properties by type
  - Search for properties

- **Dashboard Actions**
  - Open notifications
  - Open settings
  - User info display

- **Real Estate Features**
  - Home loan navigation
  - EMI calculator usage
  - Property details viewing workflow

### 3. Notification Tests (`notifications.e2e.ts`)

Tests for notification functionality:

- **In-App Notifications**
  - Display notification badge
  - Open notifications list
  - Display notification types
  - Clear notification when tapped
  - Mark all as read
  - Delete notification

- **Push Notifications**
  - Request notification permissions
  - Handle notifications in foreground
  - Handle notifications in background
  - Navigate to correct screen from notification

- **Notification Settings**
  - Open notification settings
  - Toggle notification types
  - Set quiet hours

- **Notification Workflows**
  - Property alert workflow
  - Message notifications workflow

## Helper Functions

The `helpers/index.ts` file provides utility functions for common testing actions:

### Available Helpers

```typescript
// Interaction helpers
waitForElementAndTap(testID, timeout)    // Wait and tap element
typeInField(testID, text)                 // Type text in input
clearInput(testID)                        // Clear input field
longPress(testID, duration)               // Long press element
swipe(testID, direction)                  // Swipe element

// Verification helpers
verifyTextDisplayed(text)                 // Check text is visible
waitForElement(testID, timeout)           // Wait for element to exist
isElementVisible(testID)                  // Check if visible
getElementText(testID)                    // Get element text
waitForScreen(title, timeout)             // Wait for screen

// Navigation helpers
dismissKeyboard()                         // Close keyboard
goBack()                                  // Go back
scrollToElement(testID)                   // Scroll to element

// Utilities
takeScreenshot(name)                      // Capture screenshot
```

### Example Usage

```typescript
import {
  waitForElementAndTap,
  typeInField,
  verifyTextDisplayed,
  dismissKeyboard
} from '../helpers';

it('should login', async () => {
  await typeInField('emailInput', 'user@example.com');
  await typeInField('passwordInput', 'password');
  await dismissKeyboard();
  
  await waitForElementAndTap('loginButton');
  
  await verifyTextDisplayed('Dashboard');
});
```

## Test Configuration

### Test Data

Default test credentials in `e2e/config.ts`:

```typescript
export const TEST_DATA = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123',
    fullName: 'Test User'
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'WrongPassword'
  },
  propertyData: {
    type: 'Apartment',
    price: '5000000',
    location: 'Delhi',
    description: 'Beautiful 2BHK apartment'
  }
};
```

### Modify Test Data

Set environment variables:

```bash
# Set API URL
export REACT_APP_API_URL=http://your-backend-url

# Set test credentials
export TEST_EMAIL=your-test-email@example.com
export TEST_PASSWORD=your-test-password

# Run tests
npm run test:e2e
```

## Best Practices

### 1. Use Test IDs

All interactive elements should have `testID` props:

```typescript
// In your React Native component
<TouchableOpacity testID="loginButton">
  <Text>Login</Text>
</TouchableOpacity>

// In test
await waitForElementAndTap('loginButton');
```

### 2. Meaningful Test Names

```typescript
// Good
it('should display validation error when email is empty', async () => {

// Avoid
it('test email', async () => {
```

### 3. Independent Tests

Each test should be independent and not rely on previous tests:

```typescript
beforeEach(async () => {
  // Reset state before each test
  await device.reloadReactNative();
});
```

### 4. Use Descriptive Describes

Organize tests in logical groups:

```typescript
describe('Authentication', () => {
  describe('Login', () => {
    it('...', async () => {});
  });
  
  describe('Logout', () => {
    it('...', async () => {});
  });
});
```

### 5. Add Screenshots

Capture screenshots for visual verification:

```typescript
await takeScreenshot('step-name');
```

Screenshots are saved in `artifacts/` directory.

## Writing New Tests

### Template

```typescript
// e2e/tests/feature.e2e.ts

import {
  waitForElementAndTap,
  typeInField,
  verifyTextDisplayed,
  waitForScreen,
  takeScreenshot
} from '../helpers';

describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup before each test
    await waitForScreen('ScreenName', 5000);
  });

  describe('Sub Feature', () => {
    it('should do something', async () => {
      // Arrange
      await waitForElementAndTap('actionButton');
      
      // Act
      await typeInField('inputField', 'value');
      
      // Assert
      await verifyTextDisplayed('Expected Result');
      
      // Capture
      await takeScreenshot('result');
    });
  });
});
```

### Steps to Add New Test

1. Create new file in `e2e/tests/` with `.e2e.ts` extension
2. Use helper functions from `e2e/helpers/index.ts`
3. Add test IDs to your React components
4. Run test: `npm run test:e2e`
5. Check screenshots in `artifacts/`

## Debugging Tests

### View Live Testing

Run tests with more detailed output:

```bash
npm run test:e2e:debug
```

### Take Screenshots

Automatically captured in `artifacts/` directory:

```typescript
await takeScreenshot('my-screenshot-name');
```

View screenshots after test run in the artifacts folder.

### Check Element Attributes

```typescript
const attributes = await element(by.id('myElement')).getAttributes();
console.log(attributes);
```

### Wait Longer if Needed

Increase timeout for slow operations:

```typescript
await waitFor(element(by.id('myElement')))
  .toBeVisible()
  .withTimeout(15000); // 15 seconds
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install --legacy-peer-deps
      
      - name: Build for testing
        run: npm run test:e2e:build:android
      
      - name: Run E2E tests
        run: npm run test:e2e:android
      
      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: detox-artifacts
          path: artifacts/
```

## Troubleshooting

### Build Fails

**Problem:** `xcodebuild` command not found (iOS)

**Solution:** Install Xcode Command Line Tools
```bash
xcode-select --install
```

### Tests Timeout

**Problem:** Tests timeout waiting for elements

**Solution:** 
- Increase timeout in test: `withTimeout(15000)`
- Ensure test IDs are correct in your components
- Check if app is responding properly

### Tests Can't Find Elements

**Problem:** Element not found even though visible

**Solution:**
- Verify `testID` prop is set in component
- Check for typos in testID string
- Add more specific selectors: `by.id('testID').and(by.text('text'))`

### Device Issues

**Problem:** Simulator/emulator not starting

**Solution:**
```bash
# iOS - Restart simulator
xcrun simctl shutdown all
xcrun simctl erase all

# Android - Restart emulator
emulator -avd Pixel_5_API_34 -no-snapshot-load
```

## Resources

- [Detox Documentation](https://wix.github.io/Detox/docs/intro/welcome)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## Support

For issues or questions:

1. Check test output for specific errors
2. Review Screenshots in `artifacts/`
3. Check Detox documentation
4. Enable debug logging: `npm run test:e2e:debug`
