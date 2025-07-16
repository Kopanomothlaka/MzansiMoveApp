import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Car, Package, DollarSign } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  const features = [
    {
      icon: Car,
      title: 'Book Rides',
      description: 'Book intercity and long-distance rides easily.'
    },
    {
      icon: Package,
      title: 'Send Packages',
      description: 'Send packages safely across South Africa.'
    },
    {
      icon: DollarSign,
      title: 'Dynamic Pricing',
      description: 'Negotiate fair prices through our bidding system.'
    }
  ];

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <Car size={40} color={Colors.background} style={{ marginBottom: 8 }} />
            <Text style={styles.logo}>MzansiMove</Text>
            <Text style={styles.tagline}>Your Journey, Your Price</Text>
          </View>

          {/* Hero Image */}
          <View style={styles.heroContainer}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.heroImage}
            />
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <feature.icon size={24} color={Colors.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
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
  logo: {
    fontSize: FontSizes['4xl'],
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
    marginBottom: 8,
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
  heroImage: {
    width: width * 0.8,
    height: 200,
    borderRadius: 16,
    opacity: 0.9,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  featureIcon: {
    backgroundColor: Colors.background,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.medium,
    color: Colors.background,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.background,
    opacity: 0.8,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.background,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.medium,
    color: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  secondaryButtonText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.medium,
    color: Colors.background,
  },
});