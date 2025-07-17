import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Car, Star, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { supabase } from '@/constants/supabase';

export default function DriverLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        Alert.alert('Login Failed', error.message);
      } else {
        console.log('Login successful, user ID:', data.user?.id);
        const { data: profile, error: profileError } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('user_id', data.user?.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
        }

        if (profile) {
          console.log('Driver profile found, navigating to dashboard');
          router.replace('/driver/(tabs)/dashboard');
        } else {
          console.log('No driver profile found');
          Alert.alert('Access Denied', 'This account is not registered as a driver.');
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    Alert.alert('Google Login', 'Google authentication would be implemented here');
  };

  const handleFacebookLogin = async () => {
    Alert.alert('Facebook Login', 'Facebook authentication would be implemented here');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
          {/* Decorative Header */}
          <View style={styles.decorativeHeader}>
            <View style={styles.headerDecoration}>
              <Star size={16} color={Colors.primary} style={styles.decorStar1} />
              <Car size={20} color={Colors.secondary} style={styles.decorCar} />
              <Zap size={14} color={Colors.warning} style={styles.decorZap} />
            </View>
          </View>

          {/* Logo and Title */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.logoCircle}
              >
                <Shield size={40} color={Colors.background} />
              </LinearGradient>
              <View style={styles.logoAccent}>
                <Car size={24} color={Colors.primary} />
              </View>
            </View>
            <Text style={styles.logoText}>MzansiMove</Text>
            <Text style={styles.logoSubtext}>Driver Portal</Text>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.subtitleText}>Sign in to your driver account</Text>
            </View>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
                <ArrowRight size={20} color={Colors.background} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Social Login */}
          <View style={styles.socialSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerTextContainer}>
                <Text style={styles.dividerText}>or continue with</Text>
              </View>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
                <LinearGradient
                  colors={['#DB4437', '#C23321']}
                  style={styles.socialButtonGradient}
                >
                  <Text style={styles.socialButtonText}>Google</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
                <LinearGradient
                  colors={['#4267B2', '#365899']}
                  style={styles.socialButtonGradient}
                >
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupSection}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/driver/auth/register')}>
              <Text style={styles.signupLink}>Sign up as a driver</Text>
            </TouchableOpacity>
          </View>

          {/* Driver Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Why Drive with MzansiMove?</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Shield size={16} color={Colors.success} />
                </View>
                <Text style={styles.benefitText}>Verified Passengers</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Star size={16} color={Colors.warning} />
                </View>
                <Text style={styles.benefitText}>Earn More</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Zap size={16} color={Colors.primary} />
                </View>
                <Text style={styles.benefitText}>Flexible Hours</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  decorativeHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerDecoration: {
    position: 'relative',
    width: 60,
    height: 40,
  },
  decorStar1: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  decorCar: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  decorZap: {
    position: 'absolute',
    bottom: 0,
    right: 10,
  },
  logoSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 48,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoAccent: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoText: {
    fontSize: FontSizes['2xl'],
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    paddingVertical: 16,
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.primary,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loginButtonText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
  },
  socialSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerTextContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  dividerText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  socialButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  signupText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.primary,
  },
  benefitsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  benefitsTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  benefitsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  benefitItem: {
    alignItems: 'center',
    gap: 8,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  benefitText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    textAlign: 'center',
  },
});