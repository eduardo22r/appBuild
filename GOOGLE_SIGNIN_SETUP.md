# Google Sign-In Setup Guide

This guide walks you through setting up Google Sign-In for the Language Learning App using Expo and Firebase.

## Overview

The app uses:
- **expo-auth-session** for Google OAuth flow
- **Firebase Authentication** for user management
- **Google Cloud Console** for OAuth credentials

## Prerequisites

Before starting, ensure you have:
- [ ] Google account
- [ ] Firebase project (or create one at https://console.firebase.google.com)
- [ ] Google Cloud Console access (https://console.cloud.google.com)
- [ ] Expo account (optional, for publishing)

---

## Step 1: Set Up Firebase Project

### 1.1 Create/Select Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or select existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### 1.2 Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"** section
3. Click **Web app icon** (`</>`) to register a web app
4. Copy the Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

5. Update `src/config/firebase.ts` with these values

### 1.3 Enable Google Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Google** provider
3. Click **Enable** toggle
4. Set **Project support email** (your email)
5. Click **Save**

---

## Step 2: Set Up Google Cloud Console

### 2.1 Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project (it's automatically created)
   - Or create a new project if needed

### 2.2 Enable Google+ API

1. Go to **APIs & Services** → **Library**
2. Search for **"Google+ API"** or **"Google People API"**
3. Click **Enable**

### 2.3 Create OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (for public app)
3. Click **Create**
4. Fill in required fields:
   - **App name**: Language Learning App
   - **User support email**: Your email
   - **App logo**: (optional)
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. **Scopes**: Click **Add or Remove Scopes**
   - Select: `email`, `profile`, `openid`
   - Click **Update** and **Save and Continue**
7. **Test users**: Add your email for testing
8. Click **Back to Dashboard**

### 2.4 Create OAuth 2.0 Client IDs

You need to create separate client IDs for each platform:

#### For Web (Required for Expo)

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Application type**: **Web application**
4. Name: "Language Learning App - Web"
5. **Authorized JavaScript origins**:
   - `https://auth.expo.io`
   - `http://localhost:19006` (for local development)
6. **Authorized redirect URIs**:
   - `https://auth.expo.io/@YOUR_EXPO_USERNAME/language-learning-app`
   - `http://localhost:19006` (for web development)
7. Click **Create**
8. **Copy the Client ID** - This is your **Web Client ID**

#### For iOS

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select **Application type**: **iOS**
3. Name: "Language Learning App - iOS"
4. **Bundle ID**: `com.languagelearning.app` (from app.json)
5. Click **Create**
6. **Copy the Client ID** - This is your **iOS Client ID**

#### For Android

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select **Application type**: **Android**
3. Name: "Language Learning App - Android"
4. **Package name**: `com.languagelearning.app` (from app.json)
5. **SHA-1 certificate fingerprint**:

   For development (Expo):
   ```bash
   # Get Expo's debug keystore fingerprint
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

   For production:
   ```bash
   # Get your production keystore fingerprint
   keytool -list -v -keystore path/to/your-release-key.keystore -alias your-key-alias
   ```

   Copy the SHA-1 fingerprint (looks like: `AA:BB:CC:DD:...`)

6. Click **Create**
7. **Copy the Client ID** - This is your **Android Client ID**

---

## Step 3: Configure Your App

### 3.1 Update firebase.ts

Edit `src/config/firebase.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // From Step 1.2
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx",
};

export const googleSignInConfig = {
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",     // From Step 2.4 (Web)
  iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",     // From Step 2.4 (iOS)
  androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com", // From Step 2.4 (Android)
  expoClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",    // Same as webClientId
};

export const authConfig = {
  enableEmailAuth: true,
  enableGoogleAuth: true,
  enableAppleAuth: true,
  demoMode: false, // Set to false to use real authentication
  sessionTimeout: 30 * 24 * 60 * 60 * 1000,
  rememberMe: true,
};
```

### 3.2 Update Redirect URI (Important!)

The redirect URI must match what you entered in Google Cloud Console.

**For Expo Go (Development):**
- Format: `https://auth.expo.io/@YOUR_EXPO_USERNAME/language-learning-app`
- Replace `YOUR_EXPO_USERNAME` with your Expo username

**To find your Expo username:**
```bash
expo whoami
```

**For Standalone Builds:**
- Use your custom scheme: `languagelearningapp://redirect`

---

## Step 4: Test Google Sign-In

### 4.1 Local Testing

1. Start your Expo development server:
   ```bash
   npm start
   ```

2. Open the app on your device/simulator

3. On Login screen, tap **"Google"** button

4. You should see Google's OAuth consent screen

5. Select your Google account

6. Grant permissions

7. You should be redirected back to the app and signed in

### 4.2 Common Issues

#### "Invalid client ID"
- **Cause**: Client ID doesn't match the platform
- **Solution**: Verify you're using the correct client ID for the platform (web/iOS/Android)

#### "Redirect URI mismatch"
- **Cause**: Redirect URI in Google Cloud Console doesn't match the app
- **Solution**: Add the correct redirect URI to your OAuth client settings

#### "Access blocked: Authorization Error"
- **Cause**: OAuth consent screen not configured
- **Solution**: Complete OAuth consent screen setup (Step 2.3)

#### "Sign-in attempt failed"
- **Cause**: Network issues or expired tokens
- **Solution**: Check internet connection, restart app

#### iOS: "No identities are available"
- **Cause**: iOS client ID not configured
- **Solution**: Verify iOS client ID in Google Cloud Console

#### Android: "Sign in failed"
- **Cause**: SHA-1 fingerprint mismatch
- **Solution**: Ensure correct SHA-1 fingerprint is added to Android OAuth client

---

## Step 5: Production Deployment

### 5.1 Update OAuth Consent Screen

1. Go to **OAuth consent screen** in Google Cloud Console
2. Change from **Testing** to **In Production**
3. This allows any Google user to sign in (not just test users)

### 5.2 Build Standalone Apps

#### For iOS:

```bash
eas build --platform ios
```

Requirements:
- Apple Developer account
- iOS distribution certificate
- Provisioning profile

#### For Android:

```bash
eas build --platform android
```

Requirements:
- Upload keystore to EAS
- Update SHA-1 fingerprint in Google Cloud Console

### 5.3 Update Redirect URIs

For production builds, update redirect URIs in Google Cloud Console:

**iOS Production:**
- Add: `com.languagelearning.app:/oauth2redirect`

**Android Production:**
- Add: `com.languagelearning.app:/oauth2redirect`

---

## Environment Variables (Recommended)

For better security, use environment variables instead of hardcoding credentials:

### 5.4 Create .env file

```bash
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
FIREBASE_PROJECT_ID=your-app-id
FIREBASE_STORAGE_BUCKET=your-app.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx

# Google Sign-In
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
GOOGLE_EXPO_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

### 5.5 Install dotenv

```bash
npm install dotenv
```

### 5.6 Update firebase.ts

The file already uses `process.env`, so environment variables will be loaded automatically.

**Important**: Add `.env` to `.gitignore` to prevent committing secrets!

---

## Verification Checklist

Before going live, verify:

- [ ] Firebase project created and configured
- [ ] Google Sign-In enabled in Firebase Authentication
- [ ] OAuth consent screen configured in Google Cloud Console
- [ ] Web, iOS, and Android OAuth client IDs created
- [ ] Redirect URIs added to Google Cloud Console
- [ ] Client IDs updated in `src/config/firebase.ts`
- [ ] `demoMode` set to `false` in `authConfig`
- [ ] App scheme configured in `app.json`
- [ ] SHA-1 fingerprints added (Android)
- [ ] Bundle ID matches (iOS)
- [ ] Package name matches (Android)
- [ ] Google Sign-In tested on all platforms
- [ ] OAuth consent screen published (for production)

---

## Debugging

### Enable Debug Logging

Add this to see detailed Google Sign-In logs:

```typescript
// In src/screens/LoginScreen.tsx
console.log('Google auth request:', request);
console.log('Google auth response:', response);
```

### Test with Different Accounts

Test with multiple Google accounts to ensure:
- First-time sign-in works
- Returning user sign-in works
- Account switching works
- Sign-out and re-sign-in works

### Monitor Firebase Authentication

1. Go to Firebase Console → Authentication → Users
2. You should see users appear after successful sign-in
3. Check provider shows "Google"

---

## Additional Resources

- [Expo Auth Session Docs](https://docs.expo.dev/guides/authentication/)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Google Cloud Console](https://console.cloud.google.com)
- [OAuth 2.0 Overview](https://developers.google.com/identity/protocols/oauth2)

---

## Support

If you encounter issues:

1. Check Firebase Console → Authentication → Users for error logs
2. Check Expo logs: `expo start --dev-client`
3. Verify all Client IDs match your configuration
4. Ensure redirect URIs are correctly configured
5. Test on physical device (simulator may have limitations)

---

**Last Updated**: 2025-10-30
**Version**: 1.0.0
