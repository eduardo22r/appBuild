import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import ConnectionStatusBar from './src/components/ConnectionStatusBar';

export default function App() {
  return (
    <AppProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <ConnectionStatusBar />
        <AppNavigator />
      </View>
    </AppProvider>
  );
}
