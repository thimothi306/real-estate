// e2e/helpers/index.ts
// Helper functions for E2E testing

/**
 * Wait for an element to be visible
 */
export async function waitForElementAndTap(testID: string, timeout = 5000) {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
  await element(by.id(testID)).tap();
}

/**
 * Type text in an input field
 */
export async function typeInField(testID: string, text: string) {
  await element(by.id(testID)).typeText(text);
}

/**
 * Verify text is displayed
 */
export async function verifyTextDisplayed(text: string) {
  await expect(element(by.text(text))).toBeVisible();
}

/**
 * Wait for element to exist
 */
export async function waitForElement(testID: string, timeout = 5000) {
  await waitFor(element(by.id(testID)))
    .toExist()
    .withTimeout(timeout);
}

/**
 * Clear text from input
 */
export async function clearInput(testID: string) {
  await element(by.id(testID)).clearText();
}

/**
 * Scroll to element
 */
export async function scrollToElement(testID: string) {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
  await element(by.id(testID)).multiTap(1);
}

/**
 * Tap and hold
 */
export async function longPress(testID: string, duration = 1000) {
  await element(by.id(testID)).longPress(duration);
}

/**
 * Swipe
 */
export async function swipe(testID: string, direction: 'up' | 'down' | 'left' | 'right') {
  const swipeDirections: Record<string, any> = {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right'
  };
  await element(by.id(testID)).swipe(swipeDirections[direction]);
}

/**
 * Get attribute from element
 */
export async function getElementText(testID: string): Promise<string> {
  const attributes = await element(by.id(testID)).getAttributes();
  return attributes.text as string;
}

/**
 * Check if element is visible
 */
export async function isElementVisible(testID: string): Promise<boolean> {
  try {
    await expect(element(by.id(testID))).toBeVisible();
    return true;
  } catch {
    return false;
  }
}

/**
 * Dismiss keyboard
 */
export async function dismissKeyboard() {
  if (device.getPlatform() === 'ios') {
    await device.sendUserInteraction({ type: 'keyPress', keyCode: 66 });
  } else {
    await device.pressBack();
  }
}

/**
 * Go back (press back button)
 */
export async function goBack() {
  if (device.getPlatform() === 'ios') {
    await element(by.text('Back')).tap();
  } else {
    await device.pressBack();
  }
}

/**
 * Wait for screen with timeout
 */
export async function waitForScreen(screenTitle: string, timeout = 5000) {
  await waitFor(element(by.text(screenTitle)))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * Take screenshot for report
 */
export async function takeScreenshot(name: string) {
  await device.takeScreenshot(name);
}
