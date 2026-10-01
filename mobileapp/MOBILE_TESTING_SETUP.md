# Mobile App Testing Setup Guide

## Quick Setup Checklist

Follow these steps to prepare your Kavuri Estates mobile app for E2E testing with Detox.

### Step 1: Add Test IDs to Components

Detox identifies elements using `testID` props. Add these to all interactive components you want to test.

#### Login Screen Example

```typescript
// src/screens/LoginScreen.tsx
import { TextInput, TouchableOpacity, Text } from 'react-native';

export const LoginScreen = () => {
  return (
    <>
      <TextInput
        testID="emailInput"
        placeholder="Enter email"
      />
      <TextInput
        testID="passwordInput"
        placeholder="Enter password"
        secureTextEntry
      />
      <TouchableOpacity testID="loginButton">
        <Text>Login</Text>
      </TouchableOpacity>
      <Text onPress={() => navigation.navigate('Signup')} testID="signupLink">
        Don't have account? Sign up
      </Text>
    </>
  );
};
```

#### Essential Test IDs to Add

**Authentication Screen**
```
- emailInput
- passwordInput
- loginButton
- signupLink
- signupButton
- fullnameInput
- confirmPasswordInput
- logoutButton
```

**Dashboard Screen**
```
- tabBar (bottom navigation)
- propertiesTab
- favoritesTab
- profileTab
- notificationBell
- notificationBadge
- settingsButton
```

**Properties Screen**
```
- propertyList
- propertyItem-0, propertyItem-1, etc.
- filterButton
- searchInput
- addFavoriteButton
```

**Notifications Screen**
```
- notificationList
- notificationItem-0, notificationItem-1, etc.
- markAllReadButton
- deleteButton
- propertyAlertsToggle
- promotionsToggle
```

### Step 2: Backend Preparation

Ensure your backend has test endpoints ready:

```bash
# Create test user (if not exists)
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "TestPassword123",
  "name": "Test User"
}

# Or use existing test user
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "TestPassword123"
}
```

Update `.env` or test configuration with:
```
REACT_APP_API_URL=<your-backend-url>
```

### Step 3: Configure Test Account

Set up a test account in your backend:

```sql
-- SQL to create test user (if using database)
INSERT INTO users (email, password, name, created_at)
VALUES ('test@example.com', 'hashed_password', 'Test User', NOW());
```

### Step 4: Build for Testing

#### iOS

```bash
# Build the test app
npm run test:e2e:build

# Or build manually
detox build-app --configuration ios.sim.debug
```

#### Android

```bash
# Build the test app
npm run test:e2e:build:android

# Or build manually
detox build-app --configuration android.emu.debug
```

### Step 5: Run Tests

```bash
# iOS
npm run test:e2e

# Android
npm run test:e2e:android
```

## Important: Add Test IDs to Key Components

### Priority 1: Critical Components (Add First)

These are essential for the test suite to work:

**LoginScreen.tsx**
```typescript
<TextInput testID="emailInput" />
<TextInput testID="passwordInput" />
<TouchableOpacity testID="loginButton" />
<Text testID="signupLink" />
```

**DashboardScreen.tsx**
```typescript
<View testID="tabBar">
  <TouchableOpacity testID="propertiesTab" />
  <TouchableOpacity testID="favoritesTab" />
  <TouchableOpacity testID="profileTab" />
</View>
<TouchableOpacity testID="notificationBell" />
```

**PropertiesListScreen.tsx**
```typescript
<FlatList testID="propertyList">
  {properties.map((prop, idx) => (
    <TouchableOpacity key={idx} testID={`propertyItem-${idx}`} />
  ))}
</FlatList>
```

### Priority 2: Supporting Components (Add Next)

**ProfileScreen.tsx**
```typescript
<TouchableOpacity testID="logoutButton" />
<TouchableOpacity testID="settingsButton" />
```

**NotificationsScreen.tsx**
```typescript
<FlatList testID="notificationList">
  {notifications.map((notif, idx) => (
    <TouchableOpacity key={idx} testID={`notificationItem-${idx}`} />
  ))}
</FlatList>
<TouchableOpacity testID="markAllReadButton" />
```

### Priority 3: Nice-to-Have (Add Later)

Details, filters, and minor components.

## Recommended Workflow

### Day 1: Setup
1. ✅ Install Detox (already done)
2. ⬜ Add test IDs to critical components
3. ⬜ Build test app

### Day 2: First Tests
4. ⬜ Run authentication tests
5. ⬜ Fix failing tests
6. ⬜ Add missing test IDs

### Day 3: Full Suite
7. ⬜ Run dashboard tests
8. ⬜ Run notification tests
9. ⬜ Generate test report

### Day 4+: Continuous Testing
10. ⬜ Integrate with CI/CD
11. ⬜ Add new tests as features are added

## Modifying Components: Code Example

### Before (No Test IDs)
```typescript
<TouchableOpacity onPress={handleLogin}>
  <Text>Login</Text>
</TouchableOpacity>
```

### After (With Test ID)
```typescript
<TouchableOpacity 
  testID="loginButton"
  onPress={handleLogin}
>
  <Text>Login</Text>
</TouchableOpacity>
```

## Quick Reference: Where to Add Test IDs

Find all screens and add test IDs:

```bash
# Search for screens
find src/screens -name "*.tsx" -o -name "*.ts"

# Search for components
find src/components -name "*.tsx" -o -name "*.ts"
```

## Next Steps

1. **Add Test IDs** - Update your React components
2. **Build App** - Run `npm run test:e2e:build`
3. **Run Tests** - Execute `npm run test:e2e`
4. **Fix Issues** - Check error messages and update components
5. **Generate Report** - Review test results

## Common Issues

### Tests Can't Find Elements
**Cause:** Missing testID props
**Solution:** Add testID to the component in your code

### App Won't Build
**Cause:** Xcode or Android SDK not installed
**Solution:** Install development tools

### Tests Timeout
**Cause:** App is slow or network issues
**Solution:** Increase timeout or check network connectivity

## Getting Help

1. Check [e2e/README.md](./README.md) for detailed documentation
2. Review test files for examples: `e2e/tests/*.e2e.ts`
3. Check helper functions: `e2e/helpers/index.ts`
4. Enable debug logging: `npm run test:e2e:debug`

## Environment Variables

Create `.env.test` file:

```bash
REACT_APP_API_URL=http://localhost:3000
TEST_EMAIL=test@example.com
TEST_PASSWORD=TestPassword123
```

Load in your app initialization if needed.
