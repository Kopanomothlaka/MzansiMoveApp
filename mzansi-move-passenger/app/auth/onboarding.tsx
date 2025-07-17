import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Car, Package, DollarSign, Shield, MapPin, Users, Star, Zap } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  const features = [
    {
      icon: Car,
      title: 'Smart Rides',
      description: 'Book intercity rides with verified drivers',
      color: Colors.primary,
      gradient: [Colors.primary, Colors.secondary]
    },
    {
      icon: Package,
      title: 'Safe Delivery',
      description: 'Send packages securely across South Africa',
      color: Colors.success,
      gradient: [Colors.success, Colors.emerald]
    },
    {
      icon: DollarSign,
      title: 'Fair Pricing',
      description: 'Negotiate prices through smart bidding',
      color: Colors.warning,
      gradient: [Colors.warning, Colors.amber]
    }
  ];

  const benefits = [
    { icon: Shield, text: 'Verified Drivers' },
    { icon: MapPin, text: 'Real-time Tracking' },
    { icon: Users, text: 'Community Driven' },
    { icon: Star, text: '4.8★ Rating' }
  ];

  return (
    <LinearGradient colors={[Colors.primary, Colors.secondary, Colors.purple]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Animated Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.logoCircle}
              >
                <Car size={48} color={Colors.background} />
              </LinearGradient>
              <View style={styles.sparkles}>
                <Zap size={16} color={Colors.background} style={styles.sparkle1} />
                <Star size={12} color={Colors.background} style={styles.sparkle2} />
                <Zap size={14} color={Colors.background} style={styles.sparkle3} />
              </View>
            </View>
            <Text style={styles.logo}>MzansiMove</Text>
            <Text style={styles.tagline}>Your Journey, Your Price</Text>
          </View>

          {/* Hero Image */}
          <View style={styles.heroContainer}>
            <View style={styles.imageWrapper}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                style={styles.heroImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(37,99,235,0.3)']}
                style={styles.imageOverlay}
              />
            </View>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.featureGradient}
                >
                  <View style={styles.featureIconContainer}>
                    <LinearGradient
                      colors={feature.gradient}
                      style={styles.featureIconBg}
                    >
                      <feature.icon size={24} color={Colors.background} />
                    </LinearGradient>
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Benefits Row */}
          <View style={styles.benefitsContainer}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <benefit.icon size={16} color={Colors.background} />
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>

          {/* CTA Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/auth/signup')}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
                style={styles.primaryButtonGradient}
              >
                <Zap size={20} color={Colors.primary} />
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.secondaryButtonText}>I have an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sparkles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle1: {
    position: 'absolute',
    top: -5,
    right: 10,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 5,
    left: -5,
  },
  sparkle3: {
    position: 'absolute',
    top: 20,
    left: -10,
  },
  logo: {
    fontSize: FontSizes['4xl'],
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
    opacity: 0.9,
  },
  heroContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroImage: {
    width: width * 0.8,
    height: 180,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  featureIconContainer: {
    marginBottom: 8,
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.regular,
    color: Colors.background,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 14,
  },
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  benefitItem: {
    alignItems: 'center',
    gap: 4,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.medium,
    color: Colors.background,
  },
});