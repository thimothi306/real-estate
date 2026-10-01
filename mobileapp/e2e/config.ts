// e2e/config.ts
// Detox test configuration and setup

import detox from 'detox';
import config from './.detoxrc.json';

export const setupTestEnvironment = async () => {
  // Initialize detox
  await detox.init(config, { launchApp: false });
};

export const cleanupTestEnvironment = async () => {
  // Cleanup after tests
  await detox.cleanup();
};

// Environment variables for testing
export const TEST_CONFIG = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  TEST_EMAIL: process.env.TEST_EMAIL || 'test@example.com',
  TEST_PASSWORD: process.env.TEST_PASSWORD || 'TestPassword123',
  TIMEOUT: 5000,
  LONG_TIMEOUT: 10000
};

// Test data
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
