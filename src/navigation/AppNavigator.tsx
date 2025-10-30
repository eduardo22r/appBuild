import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';

// Screens
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import HomeScreen from '../screens/HomeScreen';
import LessonsScreen from '../screens/LessonsScreen';
import FlashcardScreen from '../screens/FlashcardScreen';
import QuizScreen from '../screens/QuizScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Lessons"
        component={LessonsScreen}
        options={{
          tabBarLabel: 'Lessons',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { selectedLanguage, isLoading } = useApp();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!selectedLanguage ? (
          <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Flashcard" component={FlashcardScreen} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
