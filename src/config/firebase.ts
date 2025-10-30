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
export const googleSignInConfig = {
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID || "your-web-client-id.apps.googleusercontent.com",
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID || "your-ios-client-id.apps.googleusercontent.com",
  androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || "your-android-client-id.apps.googleusercontent.com",
};

// Authentication Settings
export const authConfig = {
  // Enable/disable authentication methods
  enableEmailAuth: true,
  enableGoogleAuth: true,
  enableAppleAuth: true,

  // Demo mode - allows using the app without authentication
  demoMode: true,

  // Session settings
  sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
  rememberMe: true,
};
