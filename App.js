import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import MenuScreen from './screens/MenuScreen';
import WebViewScreen from './screens/WebViewScreen';
import SelectAppsScreen from './screens/SelectAppsScreen';
import StartSessionScreen from './screens/StartSessionScreen';
import SessionDetailsScreen from './screens/SessionDetailsScreen';
import EndSessionScreen from './screens/EndSessionScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MockMenu" component={MenuScreen} />
        <Stack.Screen name="WebView" component={WebViewScreen} />
        <Stack.Screen name="SelectApps" component={SelectAppsScreen} />
        <Stack.Screen name="StartSession" component={StartSessionScreen} />
        <Stack.Screen name="SessionDetails" component={SessionDetailsScreen} />
        <Stack.Screen name="EndSession" component={EndSessionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    color: '#00d4ff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 10,
  },
});
