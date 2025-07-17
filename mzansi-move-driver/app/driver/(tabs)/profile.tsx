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
  FileText,
  Award,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  Crown
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
        const { data: driverData, error: driverError } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (driverError) {
          throw driverError;
        }

        if (driverData) {
          const { data: statsData, error: statsError } = await supabase
            .rpc('get_driver_stats', { driver_id_param: user.id });

          if (statsError) {
            console.error('Error fetching driver stats:', statsError);
          }
          
          const combinedProfile = {
            ...driverData,
            id: user.id,
            email: user.email,
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
      subtitle: 'Update your details',
      icon: User,
      color: Colors.primary,
      onPress: () => router.push('/driver/settings/personal-information'),
    },
    {
      id: 'vehicle',
      title: 'Vehicle Information',
      subtitle: 'Manage your vehicle',
      icon: Car,
      color: Colors.success,
      onPress: () => router.push('/driver/settings/vehicle-information'),
    },
    {
      id: 'documents',
      title: 'Documents & Licenses',
      subtitle: 'Upload documents',
      icon: FileText,
      color: Colors.warning,
      onPress: () => router.push('/driver/settings/documents'),
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      subtitle: 'Manage earnings',
      icon: CreditCard,
      color: Colors.secondary,
      onPress: () => router.push('/driver/settings/payment-methods'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Notification settings',
      icon: Bell,
      color: Colors.info,
      onPress: () => router.push('/driver/settings/notifications'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Safety',
      subtitle: 'Security settings',
      icon: Shield,
      color: Colors.error,
      onPress: () => router.push('/driver/settings/privacy-safety'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      icon: HelpCircle,
      color: Colors.purple,
      onPress: () => router.push('/driver/settings/help-support'),
    },
    {
      id: 'settings',
      title: 'App Settings',
      subtitle: 'Preferences',
      icon: Settings,
      color: Colors.textSecondary,
      onPress: () => router.push('/driver/settings/app-settings'),
    },
  ];

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Trips',
      value: driverProfile?.total_trips || 0,
      color: Colors.primary,
      gradient: [Colors.primary, Colors.secondary]
    },
    {
      icon: Star,
      label: 'Rating',
      value: driverProfile?.average_rating ? driverProfile.average_rating.toFixed(1) : 'New',
      color: Colors.warning,
      gradient: [Colors.warning, Colors.amber]
    },
    {
      icon: DollarSign,
      label: 'This Month',
      value: 'R2,450',
      color: Colors.success,
      gradient: [Colors.success, Colors.emerald]
    },
    {
      icon: Clock,
      label: 'Online Hours',
      value: '127h',
      color: Colors.info,
      gradient: [Colors.info, Colors.cyan]
    }
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <Zap size={32} color={Colors.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.headerIconGradient}
              >
                <User size={24} color={Colors.background} />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Driver Profile</Text>
              <Text style={styles.headerSubtitle}>Manage your account</Text>
            </View>
          </View>
        </View>

        {/* Enhanced Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary, Colors.purple]}
            style={styles.profileGradient}
          >
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Image
                    source={{ uri: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200' }}
                    style={styles.avatarImage}
                  />
                </View>
                <View style={styles.premiumBadge}>
                  <Crown size={16} color={Colors.warning} />
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
                    {driverProfile?.average_rating ? driverProfile.average_rating.toFixed(1) : 'New'} 
                    ({driverProfile?.total_trips || 0} trips)
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Shield size={12} color={Colors.background} />
                  <Text style={styles.statusText}>Verified Driver</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                  style={styles.statCardGradient}
                >
                  <View style={styles.statIconContainer}>
                    <LinearGradient
                      colors={stat.gradient}
                      style={styles.statIconBg}
                    >
                      <stat.icon size={20} color={Colors.background} />
                    </LinearGradient>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Phone size={20} color={Colors.primary} />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{driverProfile?.phone || 'Not available'}</Text>
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Mail size={20} color={Colors.primary} />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{driverProfile?.email || 'Not available'}</Text>
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <MapPin size={20} color={Colors.primary} />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue}>{driverProfile?.city || 'Not available'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          
          <View style={styles.vehicleCard}>
            <LinearGradient
              colors={['rgba(16,185,129,0.1)', 'rgba(5,150,105,0.05)']}
              style={styles.vehicleGradient}
            >
              <View style={styles.vehicleHeader}>
                <View style={styles.vehicleIconContainer}>
                  <Car size={24} color={Colors.success} />
                </View>
                <Text style={styles.vehicleTitle}>
                  {driverProfile?.vehicle_make || 'Vehicle'} {driverProfile?.vehicle_model || 'Not specified'}
                </Text>
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
            </LinearGradient>
          </View>
        </View>

        {/* Settings & Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings & Preferences</Text>
          
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                  style={styles.menuItemGradient}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                      <item.icon size={20} color={item.color} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={Colors.textSecondary} />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient
              colors={[Colors.error + '20', Colors.error + '10']}
              style={styles.logoutGradient}
            >
              <LogOut size={20} color={Colors.error} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <View style={styles.versionContainer}>
            <Zap size={16} color={Colors.primary} />
            <Text style={styles.versionText}>MzansiMove Driver v1.0.0</Text>
          </View>
          <Text style={styles.versionSubtext}>Professional Driver Portal</Text>
        </View>
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
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 16,
  },
  headerIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  profileHeader: {
    marginBottom: 24,
  },
  profileGradient: {
    padding: 24,
    paddingTop: 32,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.background,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
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
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCardGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  vehicleGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  vehicleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vehicleDetail: {
    flex: 1,
    alignItems: 'center',
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
  menuContainer: {
    gap: 8,
  },
  menuItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  logoutSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  logoutButtonText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.error,
  },
  versionSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  versionText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  versionSubtext: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
});