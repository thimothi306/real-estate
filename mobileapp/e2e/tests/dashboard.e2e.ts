// e2e/tests/dashboard.e2e.ts
// Dashboard E2E tests

import {
  waitForElementAndTap,
  waitForScreen,
  verifyTextDisplayed,
  takeScreenshot,
  swipe,
  scrollToElement
} from '../helpers';

describe('Dashboard', () => {
  beforeEach(async () => {
    // Ensure user is logged in
    await waitForScreen('Dashboard', 5000);
  });

  describe('Dashboard Navigation', () => {
    it('should display dashboard on login', async () => {
      await verifyTextDisplayed('Dashboard');
      await takeScreenshot('dashboard-main');
    });

    it('should display navigation menu', async () => {
      // Check if bottom tabs are visible
      await expect(element(by.id('tabBar'))).toBeVisible();
      await takeScreenshot('dashboard-navigation');
    });

    it('should navigate to properties screen', async () => {
      await waitForElementAndTap('propertiesTab');
      await waitForScreen('Properties', 5000);
      await takeScreenshot('properties-screen');
    });

    it('should navigate to favorites screen', async () => {
      await waitForElementAndTap('favoritesTab');
      await waitForScreen('Favorites', 5000);
      await takeScreenshot('favorites-screen');
    });

    it('should navigate to profile screen', async () => {
      await waitForElementAndTap('profileTab');
      await waitForScreen('Profile', 5000);
      await takeScreenshot('profile-screen');
    });
  });

  describe('Properties Listing', () => {
    beforeEach(async () => {
      await waitForElementAndTap('propertiesTab');
      await waitForScreen('Properties', 5000);
    });

    it('should display properties list', async () => {
      await expect(element(by.id('propertyList'))).toBeVisible();
      await takeScreenshot('properties-list');
    });

    it('should load more properties on scroll', async () => {
      const initialCount = await element(by.id('propertyItem')).getAttributes();
      
      // Scroll down
      await swipe(by.id('propertyList'), 'up');
      
      // Wait for new items to load
      await waitFor(element(by.id('propertyItem')))
        .toHaveToggleValue(true)
        .withTimeout(5000);
      
      await takeScreenshot('properties-scroll-loaded');
    });

    it('should open property details', async () => {
      await waitForElementAndTap('propertyItem-0');
      await waitForScreen('Property Details', 5000);
      await takeScreenshot('property-details');
    });

    it('should add property to favorites', async () => {
      await waitForElementAndTap('propertyItem-0');
      await waitForScreen('Property Details', 5000);
      
      await waitForElementAndTap('addFavoriteButton');
      await verifyTextDisplayed('Added to favorites');
      await takeScreenshot('property-added-favorite');
    });

    it('should filter properties by type', async () => {
      await waitForElementAndTap('filterButton');
      await waitForScreen('Filters', 5000);
      
      await waitForElementAndTap('propertyTypeFilter');
      await waitForElementAndTap('apartmentOption');
      await waitForElementAndTap('applyButton');
      
      await waitForScreen('Properties', 5000);
      await takeScreenshot('properties-filtered');
    });

    it('should search for properties', async () => {
      await waitForElementAndTap('searchInput');
      await element(by.id('searchInput')).typeText('Delhi');
      
      await waitFor(element(by.id('propertyItem')))
        .toBeVisible()
        .withTimeout(5000);
      
      await takeScreenshot('properties-search-result');
    });
  });

  describe('Dashboard Actions', () => {
    it('should open notifications', async () => {
      await waitForElementAndTap('notificationBell');
      await waitForScreen('Notifications', 5000);
      await takeScreenshot('notifications-list');
    });

    it('should open settings', async () => {
      await waitForElementAndTap('settingsButton');
      await waitForScreen('Settings', 5000);
      await takeScreenshot('settings-screen');
    });

    it('should display user info in header', async () => {
      await verifyTextDisplayed('Test User');
      await takeScreenshot('dashboard-user-info');
    });
  });

  describe('Real Estate Features', () => {
    it('should navigate to home loan calculator', async () => {
      await waitForElementAndTap('homeLoansTab');
      await waitForScreen('Home Loans', 5000);
      await takeScreenshot('home-loans-screen');
    });

    it('should use EMI calculator', async () => {
      await waitForElementAndTap('emiCalculatorButton');
      await waitForScreen('EMI Calculator', 5000);
      
      // Enter loan amount
      await element(by.id('loanAmountInput')).typeText('2000000');
      
      // Enter rate
      await element(by.id('rateInput')).typeText('7.5');
      
      // Enter tenure
      await element(by.id('tenureInput')).typeText('20');
      
      // Calculate
      await waitForElementAndTap('calculateButton');
      
      // Verify result
      await expect(element(by.id('monthlyEmiResult'))).toBeVisible();
      await takeScreenshot('emi-calculator-result');
    });

    it('should view property details with full workflow', async () => {
      // Navigate to properties
      await waitForElementAndTap('propertiesTab');
      await waitForScreen('Properties', 5000);
      
      // Select property
      await waitForElementAndTap('propertyItem-0');
      await waitForScreen('Property Details', 5000);
      
      // Scroll to see full details
      await scrollToElement('propertyDescription');
      
      // Check image gallery
      await expect(element(by.id('imageGallery'))).toBeVisible();
      
      // Check amenities
      await scrollToElement('amenitiesList');
      await expect(element(by.id('amenitiesList'))).toBeVisible();
      
      // Check contact button
      await scrollToElement('contactAgentButton');
      await takeScreenshot('property-details-full');
    });
  });
});
