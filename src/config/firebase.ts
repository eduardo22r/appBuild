// Firebase Configuration
// Replace these with your actual Firebase project credentials

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-api-key-here",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

// Google Sign-In Configuration
// Get these from Google Cloud Console: https://console.cloud.google.com/
// 1. Create OAuth 2.0 Client IDs for each platform
// 2. For Expo: Use expo.io/@your-username/your-app-slug as redirect URI
export const googleSignInConfig = {
  // Web Client ID (from Firebase Console or Google Cloud Console)
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID || "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",

  // iOS Client ID (from Google Cloud Console)
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID || "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",

  // Android Client ID (from Google Cloud Console)
  androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",

  // Expo Client ID (for Expo Go and development)
  // This is the same as Web Client ID in most cases
  expoClientId: process.env.GOOGLE_EXPO_CLIENT_ID || process.env.GOOGLE_WEB_CLIENT_ID || "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
};

// Authentication Settings
export const authConfig = {
  // Enable/disable authentication methods
  enableEmailAuth: true,
  enableGoogleAuth: true,
  enableAppleAuth: true,

  // Demo mode - allows using the app without authentication
  // Set to false when you have real Firebase credentials configured
  demoMode: true,

  // Session settings
  sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
  rememberMe: true,
};

