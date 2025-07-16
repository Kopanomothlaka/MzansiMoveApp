import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    // Show splash for 3 seconds, then navigate to login
    const timer = setTimeout(() => {
      router.replace('/driver/auth/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🚗</Text>
          </View>
          <Text style={styles.title}>MzansiMove</Text>
          <Text style={styles.subtitle}>Driver Portal</Text>
          <Text style={styles.tagline}>Your trusted ride-sharing platform</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 80,
  },
  title: {
    fontSize: FontSizes['4xl'],
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
    opacity: 0.9,
    marginBottom: 16,
  },
  tagline: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.background,
    opacity: 0.7,
  },
}); 