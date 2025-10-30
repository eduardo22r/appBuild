import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  AuthError,
  Auth,
} from 'firebase/auth';
import { firebaseConfig, authConfig } from '../config/firebase';
import { storage } from '../utils/storage';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey &&
         !firebaseConfig.apiKey.includes('your-api-key') &&
         !firebaseConfig.apiKey.includes('process.env');
};

// Initialize Firebase only if properly configured
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured()) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    console.log('✓ Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.log('⚠ Firebase not configured - running in demo mode');
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  provider: string;
}

type AuthStateListener = (user: AuthUser | null) => void;

class AuthService {
  private authListeners: AuthStateListener[] = [];
  private currentUser: AuthUser | null = null;

  constructor() {
    // Set up auth state listener only if Firebase is configured
    if (auth) {
      onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          this.currentUser = this.mapFirebaseUser(firebaseUser);
          this.saveUserSession(this.currentUser);
        } else {
          this.currentUser = null;
          this.clearUserSession();
        }
        this.notifyListeners(this.currentUser);
      });
    } else {
      // Demo mode - try to load saved session
      this.loadSavedSession();
    }
  }

  /**
   * Load saved session (for demo mode)
   */
  private async loadSavedSession() {
    try {
      const savedSession = await storage.getItem('userSession');
      if (savedSession) {
        this.currentUser = JSON.parse(savedSession);
        this.notifyListeners(this.currentUser);
      }
    } catch (error) {
      console.error('Error loading saved session:', error);
    }
  }

  /**
   * Map Firebase User to our AuthUser interface
   */
  private mapFirebaseUser(user: User): AuthUser {
    const providerData = user.providerData[0];
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || providerData?.displayName || null,
      photoURL: user.photoURL || providerData?.photoURL || null,
      emailVerified: user.emailVerified,
      provider: providerData?.providerId || 'email',
    };
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, displayName: string): Promise<AuthUser> {
    // Demo mode - create mock user
    if (!auth || authConfig.demoMode) {
      const demoUser: AuthUser = {
        uid: `demo-${Date.now()}`,
        email: email,
        displayName: displayName,
        photoURL: null,
        emailVerified: true,
        provider: 'email',
      };
      this.currentUser = demoUser;
      await this.saveUserSession(demoUser);
      this.notifyListeners(demoUser);
      console.log('✓ Demo mode: User created locally');
      return demoUser;
    }

    // Real Firebase authentication
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    // Demo mode - check for existing user or create one
    if (!auth || authConfig.demoMode) {
      // Try to load existing session
      const savedSession = await storage.getItem('userSession');
      if (savedSession) {
        const user = JSON.parse(savedSession);
        if (user.email === email) {
          this.currentUser = user;
          this.notifyListeners(user);
          console.log('✓ Demo mode: User signed in from saved session');
          return user;
        }
      }

      // Create new demo user if no matching session
      const demoUser: AuthUser = {
        uid: `demo-${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        photoURL: null,
        emailVerified: true,
        provider: 'email',
      };
      this.currentUser = demoUser;
      await this.saveUserSession(demoUser);
      this.notifyListeners(demoUser);
      console.log('✓ Demo mode: User signed in locally');
      return demoUser;
    }

    // Real Firebase authentication
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(idToken: string): Promise<AuthUser> {
    // Demo mode - create mock Google user
    if (!auth || authConfig.demoMode) {
      const demoUser: AuthUser = {
        uid: `demo-google-${Date.now()}`,
        email: 'demo.user@gmail.com',
        displayName: 'Demo Google User',
        photoURL: null,
        emailVerified: true,
        provider: 'google.com',
      };
      this.currentUser = demoUser;
      await this.saveUserSession(demoUser);
      this.notifyListeners(demoUser);
      console.log('✓ Demo mode: Google user signed in locally');
      return demoUser;
    }

    // Real Firebase authentication
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(idToken: string, nonce: string): Promise<AuthUser> {
    // Demo mode - create mock Apple user
    if (!auth || authConfig.demoMode) {
      const demoUser: AuthUser = {
        uid: `demo-apple-${Date.now()}`,
        email: 'demo.user@icloud.com',
        displayName: 'Demo Apple User',
        photoURL: null,
        emailVerified: true,
        provider: 'apple.com',
      };
      this.currentUser = demoUser;
      await this.saveUserSession(demoUser);
      this.notifyListeners(demoUser);
      console.log('✓ Demo mode: Apple user signed in locally');
      return demoUser;
    }

    // Real Firebase authentication
    try {
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken,
        rawNonce: nonce,
      });
      const userCredential = await signInWithCredential(auth, credential);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      if (auth) {
        await signOut(auth);
      }
      this.currentUser = null;
      await this.clearUserSession();
      this.notifyListeners(null);
      console.log('✓ User signed out');
    } catch (error) {
      if (auth) {
        throw this.handleAuthError(error as AuthError);
      }
      // In demo mode, just clear the session
      this.currentUser = null;
      await this.clearUserSession();
      this.notifyListeners(null);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    // Demo mode - simulate password reset
    if (!auth || authConfig.demoMode) {
      console.log('✓ Demo mode: Password reset email simulated for', email);
      return;
    }

    // Real Firebase authentication
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Add auth state listener
   * Returns a function to remove the listener
   */
  addAuthListener(listener: AuthStateListener): () => void {
    this.authListeners.push(listener);
    return () => this.removeAuthListener(listener);
  }

  /**
   * Remove auth state listener
   */
  removeAuthListener(listener: AuthStateListener) {
    this.authListeners = this.authListeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(user: AuthUser | null) {
    this.authListeners.forEach(listener => listener(user));
  }

  /**
   * Save user session to storage
   */
  private async saveUserSession(user: AuthUser) {
    try {
      await storage.setItem('userSession', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  }

  /**
   * Clear user session from storage
   */
  private async clearUserSession() {
    try {
      await storage.removeItem('userSession');
    } catch (error) {
      console.error('Error clearing user session:', error);
    }
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: AuthError): Error {
    let message = 'An error occurred during authentication';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      default:
        message = error.message;
    }

    return new Error(message);
  }

  /**
   * Check if demo mode is enabled
   */
  isDemoMode(): boolean {
    return authConfig.demoMode;
  }
}

export default new AuthService();
