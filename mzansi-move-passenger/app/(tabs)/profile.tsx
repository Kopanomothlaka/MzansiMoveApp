import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Settings, 
  Star, 
  MapPin, 
  Car, 
  Package, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  Edit,
  ChevronRight,
  Award,
  TrendingUp,
  Clock,
  Heart,
  Zap,
  Crown,
  Gift
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { supabase } from '@/constants/supabase';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  const userStats = {
    totalRides: 47,
    rating: 4.8,
    totalSpent: 2340,
    favoriteRoutes: 8,
    averageWaitTime: '< 5 min',
    memberSince: 'Jan 2023',
  };

  const recentActivity = [
    {
      id: '1',
      type: 'ride',
      title: 'Johannesburg → Pretoria',
      date: '2025-01-10',
      amount: 120,
      status: 'completed',
      rating: 5,
    },
    {
      id: '2',
      type: 'package',
      title: 'Cape Town → Stellenbosch',
      date: '2025-01-08',
      amount: 80,
      status: 'completed',
      rating: 4,
    },
    {
      id: '3',
      type: 'ride',
      title: 'Durban → Pietermaritzburg',
      date: '2025-01-05',
      amount: 90,
      status: 'completed',
      rating: 5,
    },
  ];

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: User, title: 'Personal Information', subtitle: 'Update your details', color: Colors.primary },
        { icon: CreditCard, title: 'Payment Methods', subtitle: '2 cards added', color: Colors.success },
        { icon: MapPin, title: 'Saved Addresses', subtitle: 'Home, Work +2 more', color: Colors.info },
        { icon: Heart, title: 'Favorite Routes', subtitle: '8 routes saved', color: Colors.error },
      ]
    },
    {
      section: 'Preferences',
      items: [
        { icon: Bell, title: 'Notifications', subtitle: 'Push, Email, SMS', hasSwitch: true, color: Colors.warning },
        { icon: Shield, title: 'Privacy & Safety', subtitle: 'Control your privacy', color: Colors.success },
        { icon: Settings, title: 'App Settings', subtitle: 'Language, Theme', color: Colors.textSecondary },
      ]
    },
    {
      section: 'Support',
      items: [
        { icon: HelpCircle, title: 'Help Center', subtitle: 'FAQs and support', color: Colors.info },
        { icon: Gift, title: 'Referral Program', subtitle: 'Earn R50 per referral', color: Colors.primary },
        { icon: LogOut, title: 'Sign Out', subtitle: '', isDestructive: true, color: Colors.error },
      ]
    }
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingUser(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (data && data.full_name) {
          setUserName(data.full_name);
        } else {
          setUserName(user.email || '');
        }
      }
      setLoadingUser(false);
    };
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/onboarding');
  };

  const handleEditProfile = () => {
    router.push('/(tabs)/personal-information');
  };

  const handleViewAllRides = () => {
    router.push('/(tabs)/rides-history');
  };

  const handleMenuItemPress = (item: any) => {
    switch (item.title) {
      case 'Personal Information':
        router.push('/(tabs)/personal-information');
        break;
      case 'Payment Methods':
        router.push('/(tabs)/payment-methods');
        break;
      case 'Saved Addresses':
        router.push('/(tabs)/saved-addresses');
        break;
      case 'Favorite Routes':
        router.push('/(tabs)/favorite-routes');
        break;
      case 'Notifications':
        // Toggle notifications (already handled by switch)
        break;
      case 'Privacy & Safety':
        router.push('/(tabs)/privacy-safety');
        break;
      case 'App Settings':
        router.push('/(tabs)/app-settings');
        break;
      case 'Help Center':
        router.push('/(tabs)/help-center');
        break;
      case 'Referral Program':
        router.push('/(tabs)/referral-program');
        break;
      case 'Sign Out':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const renderStatCard = (title: string, value: string | number, icon: any, color: string) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.statCardGradient}
      >
        <View style={[styles.statIcon, { backgroundColor: color + '30' }]}>
          {React.createElement(icon, { size: 20, color: color })}
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );

  const renderActivityItem = (activity: any) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityIconContainer}>
        <View style={[styles.activityIcon, { backgroundColor: activity.type === 'ride' ? Colors.primary + '20' : Colors.success + '20' }]}>
          {activity.type === 'ride' ? (
            <Car size={16} color={activity.type === 'ride' ? Colors.primary : Colors.success} />
          ) : (
            <Package size={16} color={Colors.success} />
          )}
        </View>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDate}>{activity.date}</Text>
      </View>
      <View style={styles.activityMeta}>
        <Text style={styles.activityAmount}>R{activity.amount}</Text>
        <View style={styles.activityRating}>
          <Star size={12} color={Colors.warning} fill={Colors.warning} />
          <Text style={styles.ratingText}>{activity.rating}</Text>
        </View>
      </View>
    </View>
  );

  const renderMenuItem = (item: any, isLast: boolean) => (
    <TouchableOpacity 
      key={item.title} 
      style={[styles.menuItem, isLast && styles.lastMenuItem]}
      onPress={() => handleMenuItemPress(item)}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuItemIcon, { backgroundColor: item.color + '20' }]}>
          <item.icon 
            size={20} 
            color={item.isDestructive ? Colors.error : item.color} 
          />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={[
            styles.menuItemTitle,
            item.isDestructive && { color: Colors.error }
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {item.hasSwitch ? (
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.background}
          />
        ) : (
          <ChevronRight size={20} color={Colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Enhanced Profile Header */}
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.profileGradient}
            >
              <View style={styles.profileInfo}>
                <View style={styles.profileImageContainer}>
                  <Image
                    source={{ uri: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200' }}
                    style={styles.profileImage}
                  />
                  <View style={styles.premiumBadge}>
                    <Crown size={12} color={Colors.warning} />
                  </View>
                </View>
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>{loadingUser ? '...' : userName}</Text>
                  <Text style={styles.profileEmail}>{loadingUser ? '...' : userEmail}</Text>
                  <View style={styles.profileRating}>
                    <Star size={16} color={Colors.background} fill={Colors.background} />
                    <Text style={styles.ratingValue}>{userStats.rating}</Text>
                    <Text style={styles.ratingCount}>({userStats.totalRides} rides)</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                  <Edit size={20} color={Colors.background} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Enhanced Stats Grid */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              {renderStatCard('Total Rides', userStats.totalRides, Car, Colors.primary)}
              {renderStatCard('Total Spent', `R${userStats.totalSpent}`, TrendingUp, Colors.success)}
              {renderStatCard('Rating', userStats.rating, Star, Colors.warning)}
              {renderStatCard('Favorites', userStats.favoriteRoutes, Heart, Colors.info)}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Clock size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Recent Rides</Text>
              </View>
              <TouchableOpacity onPress={handleViewAllRides}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityList}>
              {recentActivity.map(renderActivityItem)}
            </View>
          </View>

          {/* Menu Sections */}
          {menuItems.map((section, sectionIndex) => (
            <View key={section.section} style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{section.section}</Text>
              </View>
              <View style={styles.menuSection}>
                {section.items.map((item, itemIndex) => 
                  renderMenuItem(item, itemIndex === section.items.length - 1)
                )}
              </View>
            </View>
          ))}

          {/* App Version */}
          <View style={styles.appVersion}>
            <View style={styles.versionContainer}>
              <Zap size={16} color={Colors.primary} />
              <Text style={styles.versionText}>MzansiMove v1.0.0</Text>
            </View>
            <Text style={styles.versionSubtext}>Member since {userStats.memberSince}</Text>
          </View>
        </ScrollView>
      </LinearGradient>
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
  content: {
    flex: 1,
  },
  profileHeader: {
    marginBottom: 24,
  },
  profileGradient: {
    padding: 24,
    paddingTop: 40,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  profileRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  editButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
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
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardGradient: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  sectionLink: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.primary,
  },
  activityList: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityIconContainer: {
    marginRight: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  activityRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  menuSection: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  menuItemRight: {
    marginLeft: 12,
  },
  appVersion: {
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