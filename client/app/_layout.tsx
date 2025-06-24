import React, { useEffect, useState } from 'react';
import { Stack, Slot, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('jwt');
      setIsLoggedIn(!!token);
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return <Slot />;
}
