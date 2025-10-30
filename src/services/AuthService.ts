import { initializeApp, getApps, getApp } from 'firebase/app';
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
} from 'firebase/auth';
import { firebaseConfig, authConfig } from '../config/firebase';
import { storage } from '../utils/storage';

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);

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
    // Set up auth state listener
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
      await signOut(auth);
      this.currentUser = null;
      await this.clearUserSession();
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
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
