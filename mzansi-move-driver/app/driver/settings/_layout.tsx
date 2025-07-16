import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="personal-information" options={{ title: 'Personal Information', headerBackTitle: '' }} />
      <Stack.Screen name="vehicle-information" options={{ title: 'Vehicle Information', headerBackTitle: '' }} />
      <Stack.Screen name="documents" options={{ title: 'Documents & Licenses', headerBackTitle: '' }} />
      <Stack.Screen name="payment-methods" options={{ title: 'Payment Methods', headerBackTitle: '' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications', headerBackTitle: '' }} />
      <Stack.Screen name="privacy-safety" options={{ title: 'Privacy & Safety', headerBackTitle: '' }} />
      <Stack.Screen name="help-support" options={{ title: 'Help & Support', headerBackTitle: '' }} />
      <Stack.Screen name="app-settings" options={{ title: 'App Settings', headerBackTitle: '' }} />
    </Stack>
  );
} 