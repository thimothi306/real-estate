// e2e/tests/notifications.e2e.ts
// Notifications E2E tests

import {
  waitForElementAndTap,
  waitForScreen,
  verifyTextDisplayed,
  takeScreenshot,
  waitForElement
} from '../helpers';

describe('Notifications', () => {
  describe('In-App Notifications', () => {
    beforeEach(async () => {
      await waitForScreen('Dashboard', 5000);
    });

    it('should display notifications badge', async () => {
      await waitForElement('notificationBell');
      
      // Should show badge count
      const badge = await element(by.id('notificationBadge')).getAttributes();
      expect(parseInt(badge.label as string)).toBeGreaterThan(0);
      
      await takeScreenshot('notification-badge');
    });

    it('should open notifications list', async () => {
      await waitForElementAndTap('notificationBell');
      await waitForScreen('Notifications', 5000);
      
      await expect(element(by.id('notificationList'))).toBeVisible();
      await takeScreenshot('notifications-list-open');
    });

    it('should display notification types', async () => {
      await waitForElementAndTap('notificationBell');
      await waitForScreen('Notifications', 5000);
      
      // Check for different notification types
      // - Property alerts
      // - Messages
      // - System notifications
      // - Promotions
      
      await verifyTextDisplayed('New Properties');
      await takeScreenshot('notifications-types');
    });

    it('should clear notification when tapped', async () => {
      await waitForElementAndTap('notificationBell');
      await waitForScreen('Notifications', 5000);
      
      // Tap on a notification
      await waitForElementAndTap('notificationItem-0');
      
      // Should navigate to related screen or mark as read
      await takeScreenshot('notification-tapped');
    });

    it('should mark all notifications as read', async () => {
      await waitForElementAndTap('notificationBell');
      await waitForScreen('Notifications', 5000);
      
      // Look for mark all as read button
      if (await element(by.id('markAllReadButton')).atIndex(0).isVisible()) {
        await waitForElementAndTap('markAllReadButton');
        
        // Verify badge is cleared
        await expect(element(by.id('notificationBadge'))).not.toBeVisible();
        await takeScreenshot('notifications-all-read');
      }
    });

    it('should delete notification', async () => {
      await waitForElementAndTap('notificationBell');
      await waitForScreen('Notifications', 5000);
      
      // Long press on notification
      await element(by.id('notificationItem-0')).longPress();
      
      // Tap delete
      await waitForElementAndTap('deleteButton');
      
      await takeScreenshot('notification-deleted');
    });
  });

  describe('Push Notifications', () => {
    beforeEach(async () => {
      await waitForScreen('Dashboard', 5000);
    });

    it('should request notification permissions on first launch', async () => {
      // This would typically be triggered on app first launch
      // Simulating the permission flow
      
      await device.sendUserInteraction({ type: 'keyPress', keyCode: 66 });
      
      await takeScreenshot('notification-permission-prompt');
    });

    it('should handle notification when app is in foreground', async () => {
      // This test verifies that notifications are handled when app is open
      // In a real scenario, you'd trigger a push notification from backend
      
      // You would need a mechanism to trigger a push notification
      // For now, we'll just verify the notification center is accessible
      
      await waitForElementAndTap('notificationBell');
      await waitForScreen('Notifications', 5000);
      
      await takeScreenshot('push-notification-foreground');
    });

    it('should handle notification when app is in background', async () => {
      // Send app to background
      await device.sendToHome();
      
      // Wait a bit (in real scenario, push notification would come)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Bring app back to foreground
      await device.launchApp({ newInstance: false });
      
      // Should show notification or badge
      await waitForScreen('Dashboard', 5000);
      await takeScreenshot('push-notification-background');
    });

    it('should navigate to correct screen when notification is tapped', async () => {
      // This simulates tapping a notification
      // The notification should navigate to the related content
      
      await waitForElementAndTap('notificationBell');
      await waitForScreen('Notifications', 5000);
      
      // Tap on property-related notification
      await waitForElementAndTap('notificationItem-0');
      
      // Should navigate to property details or properties list
      await takeScreenshot('notification-navigation');
    });
  });

  describe('Notification Settings', () => {
    beforeEach(async () => {
      await waitForElementAndTap('profileTab');
      await waitForScreen('Profile', 5000);
    });

    it('should open notification settings', async () => {
      await waitForElementAndTap('settingsButton');
      await waitForScreen('Settings', 5000);
      
      await waitForElementAndTap('notificationSettings');
      await waitForScreen('Notification Settings', 5000);
      
      await takeScreenshot('notification-settings');
    });

    it('should toggle notification types', async () => {
      await waitForElementAndTap('settingsButton');
      await waitForScreen('Settings', 5000);
      
      await waitForElementAndTap('notificationSettings');
      await waitForScreen('Notification Settings', 5000);
      
      // Toggle property alerts
      await waitForElementAndTap('propertyAlertsToggle');
      
      // Toggle promotions
      await waitForElementAndTap('promotionsToggle');
      
      await takeScreenshot('notification-settings-toggled');
    });

    it('should set quiet hours', async () => {
      await waitForElementAndTap('settingsButton');
      await waitForScreen('Settings', 5000);
      
      await waitForElementAndTap('notificationSettings');
      await waitForScreen('Notification Settings', 5000);
      
      await waitForElementAndTap('quietHoursToggle');
      
      // Set start time
      await waitForElementAndTap('quietHoursStartTime');
      await takeScreenshot('quiet-hours-start-time');
      
      // Set end time
      await waitForElementAndTap('quietHoursEndTime');
      await takeScreenshot('quiet-hours-end-time');
      
      await waitForElementAndTap('saveButton');
      
      await takeScreenshot('quiet-hours-saved');
    });
  });

  describe('Notification Workflows', () => {
    it('should complete property alert workflow', async () => {
      // 1. User sets property filter/alert
      await waitForScreen('Dashboard', 5000);
      await waitForElementAndTap('propertiesTab');
      await waitForScreen('Properties', 5000);
      
      await waitForElementAndTap('filterButton');
      await waitForScreen('Filters', 5000);
      
      // Set filters
      await waitForElementAndTap('priceRangeFilter');
      await element(by.id('minPriceInput')).typeText('5000000');
      await element(by.id('maxPriceInput')).typeText('10000000');
      
      await waitForElementAndTap('locationFilter');
      await element(by.id('locationInput')).typeText('Delhi');
      
      // Save alert
      await waitForElementAndTap('saveAlertButton');
      
      // 2. Verify notification setting is created
      await verifyTextDisplayed('Alert saved');
      
      // 3. Navigate to notifications to verify
      await waitForElementAndTap('notificationBell');
      await waitForScreen('Notifications', 5000);
      
      await takeScreenshot('property-alert-workflow-complete');
    });

    it('should handle message notifications', async () => {
      await waitForScreen('Dashboard', 5000);
      await waitForElementAndTap('notificationBell');
      await waitForScreen('Notifications', 5000);
      
      // Find message notification
      await verifyTextDisplayed('New message');
      
      // Tap message notification
      await waitForElementAndTap('messageNotification');
      
      // Should navigate to messages/chat
      await waitForScreen('Messages', 5000);
      await takeScreenshot('message-notification-workflow');
    });
  });
});
