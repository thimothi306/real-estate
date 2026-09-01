import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../auth/AuthContext';
import { Loading } from '../components/ui';
import { colors, shadow } from '../theme';

import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { PropertyDetailScreen } from '../screens/PropertyDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SavedSearchesScreen } from '../screens/SavedSearchesScreen';
import { EmiCalculatorScreen } from '../screens/EmiCalculatorScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { MyVisitsScreen } from '../screens/MyVisitsScreen';
import { CompareScreen } from '../screens/CompareScreen';
import { SubscriptionPlansScreen } from '../screens/SubscriptionPlansScreen';
import { PropertyInsightsScreen } from '../screens/PropertyInsightsScreen';
import { CommunityReviewScreen } from '../screens/CommunityReviewScreen';
import { WriteReviewScreen } from '../screens/WriteReviewScreen';
import { HomeLoanScreen } from '../screens/HomeLoanScreen';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { ChatDetailScreen } from '../screens/chat/ChatDetailScreen';
import { MyListingsScreen } from '../screens/owner/MyListingsScreen';
import { CreateListingScreen } from '../screens/owner/CreateListingScreen';
import { ManageBookingsScreen } from '../screens/owner/ManageBookingsScreen';
import { ServiceHubScreen } from '../screens/services/ServiceHubScreen';
import { PostServiceRequestScreen } from '../screens/services/PostServiceRequestScreen';
import { MyServiceRequestsScreen } from '../screens/services/MyServiceRequestsScreen';
import { ServiceRequestDetailScreen } from '../screens/services/ServiceRequestDetailScreen';
import { ServiceQueueScreen } from '../screens/services/ServiceQueueScreen';
import { PartnerProfileScreen } from '../screens/services/PartnerProfileScreen';
import { PartnerDirectoryScreen } from '../screens/services/PartnerDirectoryScreen';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const screenHeaderStyle = {
  headerStyle: { backgroundColor: colors.surface, ...shadow.sm, elevation: 0, shadowOpacity: 0 },
  headerShadowVisible: false,
  headerTitleStyle: { color: colors.text, fontSize: 17, fontWeight: '700' as const },
  headerTintColor: colors.primary,
};

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? colors.primarySoft : 'transparent',
      }}
    >
      <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>{glyph}</Text>
    </View>
  );
}

function HomeHeaderRight({ navigation }: any) {
  return (
    <Pressable onPress={() => navigation.navigate('Notifications')} hitSlop={10} style={{ marginRight: 8 }}>
      <Text style={{ fontSize: 19 }}>🔔</Text>
    </Pressable>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        ...screenHeaderStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Kavuri Estates',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon glyph="🏠" focused={focused} />,
          headerRight: () => <HomeHeaderRight navigation={navigation} />,
        })}
      />
      <Tabs.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Saved',
          tabBarLabel: 'Saved',
          tabBarIcon: ({ focused }) => <TabIcon glyph="♥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon glyph="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Chat"
        component={ChatListScreen}
        options={{
          title: 'Chats',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ focused }) => <TabIcon glyph="💬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Account',
          tabBarLabel: 'Account',
          tabBarIcon: ({ focused }) => <TabIcon glyph="👤" focused={focused} />,
        }}
      />
    </Tabs.Navigator>
  );
}

function SignedInStack() {
  return (
    <AppStack.Navigator screenOptions={screenHeaderStyle}>
      <AppStack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      <AppStack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{ title: 'Property' }}
      />
      <AppStack.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'My listings' }} />
      <AppStack.Screen
        name="CreateListing"
        component={CreateListingScreen}
        options={{ title: 'Post a property' }}
      />
      <AppStack.Screen
        name="ManageBookings"
        component={ManageBookingsScreen}
        options={({ route }: any) => ({ title: route.params?.title ?? 'Booking requests' })}
      />
      <AppStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <AppStack.Screen
        name="SavedSearches"
        component={SavedSearchesScreen}
        options={{ title: 'Saved searches' }}
      />
      <AppStack.Screen
        name="EmiCalculator"
        component={EmiCalculatorScreen}
        options={{ title: 'EMI Calculator' }}
      />
      <AppStack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My bookings' }} />
      <AppStack.Screen name="MyVisits" component={MyVisitsScreen} options={{ title: 'Visit Requests' }} />
      <AppStack.Screen name="Compare" component={CompareScreen} options={{ title: 'Compare properties' }} />
      <AppStack.Screen
        name="SubscriptionPlans"
        component={SubscriptionPlansScreen}
        options={{ title: 'Subscription plans' }}
      />

      {/* Insights, community & finance */}
      <AppStack.Screen
        name="PropertyInsights"
        component={PropertyInsightsScreen}
        options={{ title: 'Property Insights' }}
      />
      <AppStack.Screen
        name="CommunityReview"
        component={CommunityReviewScreen}
        options={{ title: 'Community Review' }}
      />
      <AppStack.Screen name="WriteReview" component={WriteReviewScreen} options={{ title: 'Write a review' }} />
      <AppStack.Screen name="HomeLoan" component={HomeLoanScreen} options={{ title: 'Home Loan' }} />

      {/* Chat */}
      <AppStack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={({ route }: any) => ({ title: route.params?.title ?? 'Chat' })}
      />

      <AppStack.Screen name="Services" component={ServiceHubScreen} options={{ title: 'Services' }} />

      {/* Service marketplace */}
      <AppStack.Screen
        name="PostServiceRequest"
        component={PostServiceRequestScreen}
        options={{ title: 'Request a service' }}
      />
      <AppStack.Screen
        name="MyServiceRequests"
        component={MyServiceRequestsScreen}
        options={{ title: 'My requests' }}
      />
      <AppStack.Screen
        name="ServiceRequestDetail"
        component={ServiceRequestDetailScreen}
        options={{ title: 'Request' }}
      />
      <AppStack.Screen name="ServiceQueue" component={ServiceQueueScreen} options={{ title: 'Request queue' }} />
      <AppStack.Screen
        name="PartnerProfile"
        component={PartnerProfileScreen}
        options={{ title: 'Partner profile' }}
      />
      <AppStack.Screen
        name="PartnerDirectory"
        component={PartnerDirectoryScreen}
        options={{ title: 'Verified partners' }}
      />
    </AppStack.Navigator>
  );
}

function SignedOutStack() {
  return (
    <AuthStack.Navigator screenOptions={screenHeaderStyle}>
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Sign up' }} />
      <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} options={{ title: 'Verify phone' }} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Reset password' }}
      />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const { token, initialising } = useAuth();

  // Hold on the splash-ish loader until we know whether a saved session
  // exists, otherwise the sign-in screen flashes for returning users.
  if (initialising) return <Loading />;

  return <NavigationContainer>{token ? <SignedInStack /> : <SignedOutStack />}</NavigationContainer>;
}
