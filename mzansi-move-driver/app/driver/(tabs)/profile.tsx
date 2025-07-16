import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Car, 
  Star, 
  Settings, 
  LogOut, 
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Shield,
  HelpCircle,
  CreditCard,
  Bell,
  FileText
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { supabase } from '@/constants/supabase';

export default function DriverProfile() {
  const router = useRouter();
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDriverProfile();
  }, []);

  const loadDriverProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Fetch from driver_profiles
        const { data: driverData, error: driverError } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (driverError) {
          throw driverError;
        }

        if (driverData) {
          // 2. Fetch stats
          const { data: statsData, error: statsError } = await supabase
            .rpc('get_driver_stats', { driver_id_param: user.id });

          if (statsError) {
            console.error('Error fetching driver stats:', statsError);
          }
          
          // 3. Combine data
          const combinedProfile = {
            ...driverData,
            id: user.id, // Add user ID for display
            email: user.email, // Get email from auth session
            total_trips: statsData?.[0]?.total_trips || 0,
            average_rating: statsData?.[0]?.average_rating ? parseFloat(statsData[0].average_rating) : null,
          };
          setDriverProfile(combinedProfile);
        }
      }
    } catch (error) {
      console.error('Error loading driver profile:', error);
      Alert.alert('Error', 'Failed to load driver profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/driver/auth/login');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: User,
      color: Colors.primary,
      onPress: () => router.push('/driver/settings/personal-information'),
    },
    {
      id: 'vehicle',
      title: 'Vehicle Information',
      icon: Car,
      color: Colors.success,
      onPress: () => router.push('/driver/settings/vehicle-information'),
    },
    {
      id: 'documents',
      title: 'Documents & Licenses',
      icon: FileText,
      color: Colors.warning,
      onPress: () => router.push('/driver/settings/documents'),
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      icon: CreditCard,
      color: Colors.secondary,
      onPress: () => router.push('/driver/settings/payment-methods'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      color: Colors.info,
      onPress: () => router.push('/driver/settings/notifications'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Safety',
      icon: Shield,
      color: Colors.error,
      onPress: () => router.push('/driver/settings/privacy-safety'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      color: Colors.warning,
      onPress: () => router.push('/driver/settings/help-support'),
    },
    {
      id: 'settings',
      title: 'App Settings',
      icon: Settings,
      color: Colors.textSecondary,
      onPress: () => router.push('/driver/settings/app-settings'),
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Driver Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account</Text>
        </View>

        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.profileGradient}
          >
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <User size={40} color={Colors.background} />
                </View>
                <View style={styles.onlineIndicator} />
              </View>
              
              <View style={styles.profileDetails}>
                <Text style={styles.driverName}>
                  {`${driverProfile?.first_name || 'Driver'} ${driverProfile?.last_name || ''}`}
                </Text>
                <Text style={styles.driverId}>ID: {driverProfile?.id?.substring(0, 8) || 'N/A'}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color={Colors.background} fill={Colors.background} />
                  <Text style={styles.ratingText}>
                    {driverProfile?.average_rating ? driverProfile.average_rating.toFixed(1) : 'New'} ({driverProfile?.total_trips || 0} trips)
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Phone size={20} color={Colors.primary} />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{driverProfile?.phone || 'Not available'}</Text>
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <Mail size={20} color={Colors.primary} />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{driverProfile?.email || 'Not available'}</Text>
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <MapPin size={20} color={Colors.primary} />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue}>{driverProfile?.address || 'Not available'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <Car size={24} color={Colors.success} />
              <Text style={styles.vehicleTitle}>{driverProfile?.vehicle_model || 'Not available'}</Text>
            </View>
            
            <View style={styles.vehicleDetails}>
              <View style={styles.vehicleDetail}>
                <Text style={styles.vehicleLabel}>License Plate</Text>
                <Text style={styles.vehicleValue}>{driverProfile?.license_plate || 'N/A'}</Text>
              </View>
              
              <View style={styles.vehicleDetail}>
                <Text style={styles.vehicleLabel}>Year</Text>
                <Text style={styles.vehicleValue}>{driverProfile?.vehicle_year || 'N/A'}</Text>
              </View>
              
              <View style={styles.vehicleDetail}>
                <Text style={styles.vehicleLabel}>Color</Text>
                <Text style={styles.vehicleValue}>{driverProfile?.vehicle_color || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings & Preferences</Text>
          
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <item.icon size={20} color={item.color} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  header: {
    padding: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  profileHeader: {
    marginBottom: 24,
  },
  profileGradient: {
    padding: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  profileDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
    marginBottom: 4,
  },
  driverId: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.background + 'CC',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  vehicleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginLeft: 12,
  },
  vehicleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vehicleDetail: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  vehicleValue: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  logoutButtonText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.error,
    marginLeft: 8,
  },
}); 