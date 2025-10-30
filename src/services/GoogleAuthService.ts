import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { googleSignInConfig } from '../config/firebase';

// This is required for the auth session to work properly on web
WebBrowser.maybeCompleteAuthSession();

/**
 * Google Authentication Service
 * Handles Google OAuth flow using Expo Auth Session
 */

export interface GoogleAuthResult {
  idToken: string;
  accessToken: string;
  user: {
    email: string;
    name: string;
    picture: string;
    id: string;
  };
}

/**
 * Initialize Google Sign-In prompt
 * Returns a request object and promptAsync function
 */
export const useGoogleAuth = () => {
  const redirectUri = makeRedirectUri({
    scheme: 'languagelearningapp',
    path: 'redirect',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: googleSignInConfig.expoClientId,
    iosClientId: googleSignInConfig.iosClientId,
    androidClientId: googleSignInConfig.androidClientId,
    webClientId: googleSignInConfig.webClientId,
    scopes: ['profile', 'email'],
    redirectUri,
  });

  return { request, response, promptAsync };
};

/**
 * Get user info from Google access token
 */
export const getGoogleUserInfo = async (accessToken: string): Promise<GoogleAuthResult['user']> => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    const userInfo = await response.json();

    return {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };
  } catch (error) {
    console.error('Error fetching Google user info:', error);
    throw error;
  }
};

/**
 * Exchange authorization code for tokens
 * This is used in some OAuth flows
 */
export const exchangeCodeForTokens = async (code: string): Promise<any> => {
  // Implementation depends on your backend
  // This is typically handled by Firebase automatically
  console.log('Exchange code for tokens:', code);
  return null;
};

export default {
  useGoogleAuth,
  getGoogleUserInfo,
  exchangeCodeForTokens,
};
