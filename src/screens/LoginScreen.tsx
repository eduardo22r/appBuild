import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import AuthService from '../services/AuthService';
import { authConfig, googleSignInConfig } from '../config/firebase';
import { getGoogleUserInfo } from '../services/GoogleAuthService';

// Complete auth session for web
WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  // Google Sign-In setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: googleSignInConfig.expoClientId,
    iosClientId: googleSignInConfig.iosClientId,
    androidClientId: googleSignInConfig.androidClientId,
    webClientId: googleSignInConfig.webClientId,
  });

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignInSuccess(authentication);
    } else if (response?.type === 'error') {
      console.error('Google Sign-In error:', response.error);
      Alert.alert('Google Sign-In Error', response.error?.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    } else if (response?.type === 'cancel') {
      setGoogleLoading(false);
    }
  }, [response]);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await AuthService.signInWithEmail(email.trim(), password);
      onLoginSuccess();
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInSuccess = async (authentication: any) => {
    try {
      console.log('✓ Google authentication successful');

      // Get user info from Google
      if (authentication?.accessToken) {
        const userInfo = await getGoogleUserInfo(authentication.accessToken);
        console.log('✓ Google user info retrieved:', userInfo.email);

        // Use ID token if available, otherwise use access token
        const token = authentication.idToken || authentication.accessToken;

        // Sign in with AuthService
        await AuthService.signInWithGoogle(token);
        console.log('✓ User signed in with Google');

        // Navigate to main app
        onLoginSuccess();
      } else {
        throw new Error('No access token received from Google');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Google Sign-In Failed', (error as Error).message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Trigger Google OAuth flow
      await promptAsync();
    } catch (error) {
      console.error('Error triggering Google Sign-In:', error);
      Alert.alert('Google Sign-In Failed', (error as Error).message);
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Sign in with Apple credential
      if (credential.identityToken) {
        await AuthService.signInWithApple(
          credential.identityToken,
          credential.identityToken // In production, use a proper nonce
        );
        onLoginSuccess();
      }
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('Apple Sign-In Failed', error.message);
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Enter your email address',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            if (email.trim()) {
              try {
                await AuthService.resetPassword(email.trim());
                Alert.alert('Success', 'Password reset email sent!');
              } catch (error) {
                Alert.alert('Error', (error as Error).message);
              }
            } else {
              Alert.alert('Error', 'Please enter your email first');
            }
          },
        },
      ]
    );
  };

  const handleSkipLogin = () => {
    if (authConfig.demoMode) {
      onLoginSuccess();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={Colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.emoji}>🌟</Text>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue learning</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={Colors.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={Colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            {/* Google Sign-In */}
            {authConfig.enableGoogleAuth && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <>
                    <Text style={styles.socialIcon}>G</Text>
                    <Text style={styles.socialButtonText}>Google</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Apple Sign-In */}
            {authConfig.enableAppleAuth && Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleAppleSignIn}
                disabled={appleLoading}
              >
                {appleLoading ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <>
                    <Text style={styles.socialIcon}></Text>
                    <Text style={styles.socialButtonText}>Apple</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Skip Login (Demo Mode) */}
          {authConfig.demoMode && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkipLogin}>
              <Text style={styles.skipButtonText}>Continue without account</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
  },
  headerGradient: {
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.weights.medium,
  },
  formContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  forgotPassword: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
    textAlign: 'right',
    marginBottom: Spacing.lg,
  },
  loginButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  loginButtonGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  socialIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  socialButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  signUpText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
  },
  signUpLink: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  skipButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
