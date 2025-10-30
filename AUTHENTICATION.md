# Authentication System

## Overview
The app now supports multiple authentication methods including email/password, Google Sign-In, and Apple Sign-In (iCloud). Users can create accounts, sign in, and have their progress automatically synced across devices.

## Features

### Authentication Methods
1. **Email/Password Authentication**
   - Traditional email and password sign-up
   - Secure password storage via Firebase Authentication
   - Password reset functionality
   - Form validation (minimum 6 characters, password confirmation)

2. **Google Sign-In**
   - One-tap sign-in with Google account
   - OAuth 2.0 authentication flow
   - Automatic profile information retrieval
   - Works on both iOS and Android

3. **Apple Sign-In (iCloud)**
   - Native Apple authentication
   - Available on iOS 13+ devices
   - Privacy-focused (can hide email)
   - Seamless integration with Apple ecosystem

4. **Demo Mode (Optional)**
   - Skip authentication to try the app
   - Local progress tracking
   - Can create account later to sync progress

## Architecture

### File Structure
```
src/
├── config/
│   └── firebase.ts          # Firebase and auth provider configuration
├── services/
│   └── AuthService.ts       # Authentication service with all methods
├── screens/
│   ├── LoginScreen.tsx      # Login interface
│   └── SignUpScreen.tsx     # Account creation interface
├── context/
│   └── AppContext.tsx       # Auth state management
└── navigation/
    └── AppNavigator.tsx     # Auth-aware navigation
```

### Authentication Flow

#### 1. App Initialization
```
App Loads
    ↓
Check Auth Status (AuthService.getCurrentUser())
    ↓
├─ Authenticated → Load User Data → Main App
└─ Not Authenticated → Login/SignUp Screens
```

#### 2. Login Flow
```
User Opens App
    ↓
Login Screen Displayed
    ↓
User Selects Auth Method
    ↓
├─ Email/Password → Enter Credentials → Validate → Sign In
├─ Google → OAuth Flow → Get Token → Sign In
└─ Apple → Native Auth → Get Token → Sign In
    ↓
AuthService Updates State
    ↓
Navigation Switches to Main App
    ↓
Progress Synced from Cloud (if available)
```

#### 3. Sign Up Flow
```
User Clicks "Create Account"
    ↓
SignUp Screen Displayed
    ↓
User Enters Information
    ↓
Form Validation
    ↓
├─ Valid → Create Account → Auto Sign In
└─ Invalid → Show Error → Retry
    ↓
Welcome to App!
```

#### 4. Sign Out Flow
```
User Clicks "Sign Out" in Profile
    ↓
Confirmation Dialog
    ↓
User Confirms
    ↓
AuthService.signOut()
    ↓
Clear User Data
    ↓
Return to Login Screen
```

## Configuration

### Firebase Setup
Before using authentication in production, you need to configure Firebase:

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or select existing one
   - Enable Authentication

2. **Enable Authentication Methods**
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google (configure OAuth consent screen)
   - Enable Apple (iOS only, configure Apple Developer account)

3. **Update Configuration**
   Edit `src/config/firebase.ts`:
   ```typescript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
   };

   export const googleSignInConfig = {
     webClientId: "your-web-client-id.apps.googleusercontent.com",
     iosClientId: "your-ios-client-id.apps.googleusercontent.com",
     androidClientId: "your-android-client-id.apps.googleusercontent.com",
   };
   ```

4. **Google Sign-In Setup**
   - Download `google-services.json` (Android)
   - Download `GoogleService-Info.plist` (iOS)
   - Place in respective platform directories
   - Configure OAuth consent screen in Google Cloud Console

5. **Apple Sign-In Setup (iOS)**
   - Enable "Sign in with Apple" in Apple Developer Portal
   - Add capability to Xcode project
   - Configure Service IDs and return URLs

### Demo Mode
For development and testing, demo mode is enabled by default:
```typescript
// src/config/firebase.ts
export const authConfig = {
  demoMode: true, // Set to false for production
};
```

In demo mode:
- Users can skip authentication
- Local storage is used for progress
- No cloud sync (but offline queue works)
- Google/Apple buttons show demo alerts

## Usage

### Using Authentication in Components

```typescript
import { useApp } from '../context/AppContext';

const MyComponent = () => {
  const {
    isAuthenticated,
    authUser,
    handleLoginSuccess,
    handleLogout,
  } = useApp();

  if (!isAuthenticated) {
    return <Text>Please sign in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {authUser?.displayName}!</Text>
      <Button title="Sign Out" onPress={handleLogout} />
    </View>
  );
};
```

### AuthService Methods

```typescript
import AuthService from '../services/AuthService';

// Email/Password Sign Up
const user = await AuthService.signUpWithEmail(
  'user@example.com',
  'password123',
  'John Doe'
);

// Email/Password Sign In
const user = await AuthService.signInWithEmail(
  'user@example.com',
  'password123'
);

// Google Sign In
const user = await AuthService.signInWithGoogle(googleIdToken);

// Apple Sign In
const user = await AuthService.signInWithApple(appleIdToken, nonce);

// Sign Out
await AuthService.signOut();

// Password Reset
await AuthService.resetPassword('user@example.com');

// Check Auth Status
const isAuth = AuthService.isAuthenticated();
const currentUser = AuthService.getCurrentUser();

// Add Listener
const removeListener = AuthService.addAuthListener((user) => {
  console.log('Auth state changed:', user);
});
```

## State Management

### AppContext Integration
Authentication state is managed globally via AppContext:

```typescript
interface AppContextType {
  // ... other properties
  isAuthenticated: boolean;      // Is user signed in?
  authUser: AuthUser | null;     // Current user object
  handleLoginSuccess: () => void; // Called after successful login
  handleLogout: () => Promise<void>; // Sign out and clear data
}
```

### User Object Structure
```typescript
interface AuthUser {
  uid: string;              // Unique user ID
  email: string;            // User email
  displayName?: string;     // Full name
  photoURL?: string;        // Profile picture URL
  providerId?: string;      // Auth provider (google, apple, email)
}
```

## Security

### Best Practices Implemented
1. **Secure Password Storage**: Firebase handles password hashing and salting
2. **Token Management**: Auth tokens stored securely via AsyncStorage
3. **Session Persistence**: Users stay logged in across app restarts
4. **Auto Token Refresh**: Firebase SDK handles token refresh automatically
5. **No Plaintext Passwords**: Passwords never stored locally
6. **SSL/TLS**: All communication encrypted via HTTPS

### Privacy
- Email addresses only visible to user
- Display names can be customized
- Apple Sign-In supports email hiding
- No tracking or analytics without consent
- User data deleted on account deletion

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `auth/email-already-in-use` | Email registered | Use sign in or reset password |
| `auth/invalid-email` | Malformed email | Check email format |
| `auth/weak-password` | Password < 6 chars | Use stronger password |
| `auth/user-not-found` | Account doesn't exist | Sign up first |
| `auth/wrong-password` | Incorrect password | Try again or reset password |
| `auth/network-request-failed` | No internet | Check connection and retry |

### Error Handling Example
```typescript
try {
  await AuthService.signInWithEmail(email, password);
} catch (error: any) {
  if (error.code === 'auth/user-not-found') {
    Alert.alert('Error', 'No account found with this email');
  } else if (error.code === 'auth/wrong-password') {
    Alert.alert('Error', 'Incorrect password');
  } else {
    Alert.alert('Error', 'Failed to sign in. Please try again.');
  }
}
```

## Testing

### Manual Testing Checklist
- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with Google (both platforms)
- [ ] Sign in with Apple (iOS only)
- [ ] Password reset email
- [ ] Remember me / session persistence
- [ ] Sign out and data clearing
- [ ] Demo mode / skip authentication
- [ ] Profile screen shows correct info
- [ ] Progress syncs after authentication
- [ ] Offline authentication (cached credentials)
- [ ] Error handling for invalid credentials
- [ ] Form validation (empty fields, short passwords)

### Automated Testing
```typescript
// Example test
import AuthService from '../services/AuthService';

describe('AuthService', () => {
  it('should sign up user with email and password', async () => {
    const user = await AuthService.signUpWithEmail(
      'test@example.com',
      'password123',
      'Test User'
    );
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  it('should throw error for duplicate email', async () => {
    await expect(
      AuthService.signUpWithEmail('existing@example.com', 'password123', 'Test')
    ).rejects.toThrow();
  });
});
```

## Migration from Unauthenticated

### Migrating Existing Users
If users have progress before authentication was added:

1. **On First Sign In**:
   - Check for local progress data
   - Prompt: "Would you like to keep your existing progress?"
   - If yes: Associate local data with new account
   - If no: Start fresh

2. **Implementation**:
   ```typescript
   const handleLoginSuccess = async () => {
     const localProgress = await storage.getUserProgress();
     if (localProgress.length > 0) {
       // Merge with cloud or keep local
       await CloudSyncService.syncProgress(localProgress);
     }
   };
   ```

## Future Enhancements

### Planned Features
- [ ] Email verification requirement
- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication (Face ID, Touch ID)
- [ ] Social login (Facebook, Twitter)
- [ ] Account deletion functionality
- [ ] Profile picture upload
- [ ] Change password in-app
- [ ] Account linking (link multiple providers)
- [ ] Anonymous authentication
- [ ] Phone number authentication

### Account Management Features
- [ ] View active sessions
- [ ] Device management
- [ ] Login history
- [ ] Security notifications
- [ ] Privacy settings
- [ ] Data export (GDPR compliance)

## Troubleshooting

### Google Sign-In Not Working
1. Check `google-services.json` / `GoogleService-Info.plist` are present
2. Verify SHA-1 certificate fingerprint in Firebase Console
3. Ensure OAuth consent screen is configured
4. Check webClientId matches Firebase configuration

### Apple Sign-In Not Working
1. Verify iOS version is 13 or higher
2. Check "Sign in with Apple" capability is enabled in Xcode
3. Ensure Service ID is properly configured
4. Verify bundle ID matches Apple Developer Portal

### Session Not Persisting
1. Check AsyncStorage permissions
2. Verify Firebase persistence is enabled
3. Test on physical device (not simulator)
4. Check for storage quota issues

### Cloud Sync Not Working After Login
1. Verify internet connection
2. Check Firebase rules allow authenticated reads/writes
3. Ensure user ID is properly set in CloudSyncService
4. Check API endpoints are correct

## References

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [React Native Firebase](https://rnfirebase.io/)
- [Google Sign-In Setup](https://github.com/react-native-google-signin/google-signin)
- [Apple Sign-In Setup](https://developer.apple.com/sign-in-with-apple/)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)

---

**Version**: 1.0.0
**Last Updated**: 2025-10-30
**Author**: Language Learning App Team
