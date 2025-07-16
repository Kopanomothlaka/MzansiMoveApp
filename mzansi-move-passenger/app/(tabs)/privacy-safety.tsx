import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Shield, Eye, MapPin, Bell, Lock, Users, Smartphone } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

export default function PrivacySafetyScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    locationSharing: true,
    profileVisibility: false,
    rideHistory: true,
    notifications: true,
    emergencyContacts: true,
    dataAnalytics: false,
    biometricAuth: true,
    twoFactorAuth: false,
  });

  const handleToggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleEmergencyContacts = () => {
    Alert.alert('Emergency Contacts', 'This would open the emergency contacts management screen.');
  };

  const handleDataExport = () => {
    Alert.alert('Data Export', 'Your data export request has been submitted. You will receive an email with your data within 48 hours.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Account Deleted', 'Your account has been deleted successfully.'),
        },
      ]
    );
  };

  const privacySettings = [
    {
      id: 'locationSharing',
      title: 'Location Sharing',
      subtitle: 'Share your location during rides',
      icon: MapPin,
      type: 'switch',
    },
    {
      id: 'profileVisibility',
      title: 'Profile Visibility',
      subtitle: 'Allow service providers to see your profile',
      icon: Users,
      type: 'switch',
    },
    {
      id: 'rideHistory',
      title: 'Ride History',
      subtitle: 'Store your ride history',
      icon: Eye,
      type: 'switch',
    },
    {
      id: 'dataAnalytics',
      title: 'Data Analytics',
      subtitle: 'Help improve our service',
      icon: Smartphone,
      type: 'switch',
    },
  ];

  const safetySettings = [
    {
      id: 'notifications',
      title: 'Safety Notifications',
      subtitle: 'Get alerts about your rides',
      icon: Bell,
      type: 'switch',
    },
    {
      id: 'emergencyContacts',
      title: 'Emergency Contacts',
      subtitle: 'Manage emergency contacts',
      icon: Shield,
      type: 'button',
    },
    {
      id: 'biometricAuth',
      title: 'Biometric Authentication',
      subtitle: 'Use fingerprint or face ID',
      icon: Lock,
      type: 'switch',
    },
    {
      id: 'twoFactorAuth',
      title: 'Two-Factor Authentication',
      subtitle: 'Add extra security to your account',
      icon: Lock,
      type: 'switch',
    },
  ];

  const renderSettingItem = (setting: any) => (
    <View key={setting.id} style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <setting.icon size={20} color={Colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{setting.title}</Text>
          <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
        </View>
      </View>
      <View style={styles.settingRight}>
        {setting.type === 'switch' ? (
          <Switch
            value={settings[setting.id as keyof typeof settings] as boolean}
            onValueChange={() => handleToggleSetting(setting.id)}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.background}
          />
        ) : (
          <TouchableOpacity
            style={styles.settingButton}
            onPress={handleEmergencyContacts}
          >
            <Text style={styles.settingButtonText}>Manage</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Privacy & Safety</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            <View style={styles.settingsList}>
              {privacySettings.map(renderSettingItem)}
            </View>
          </View>

          {/* Safety Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety Features</Text>
            <View style={styles.settingsList}>
              {safetySettings.map(renderSettingItem)}
            </View>
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            <View style={styles.dataActions}>
              <TouchableOpacity style={styles.dataAction} onPress={handleDataExport}>
                <View style={styles.dataActionIcon}>
                  <Smartphone size={20} color={Colors.primary} />
                </View>
                <View style={styles.dataActionContent}>
                  <Text style={styles.dataActionTitle}>Export My Data</Text>
                  <Text style={styles.dataActionSubtitle}>Download all your data</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dataAction} onPress={handleDeleteAccount}>
                <View style={[styles.dataActionIcon, { backgroundColor: Colors.error + '20' }]}>
                  <Shield size={20} color={Colors.error} />
                </View>
                <View style={styles.dataActionContent}>
                  <Text style={[styles.dataActionTitle, { color: Colors.error }]}>Delete Account</Text>
                  <Text style={styles.dataActionSubtitle}>Permanently delete your account</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy Policy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>
            <View style={styles.legalLinks}>
              <TouchableOpacity style={styles.legalLink}>
                <Text style={styles.legalLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.legalLink}>
                <Text style={styles.legalLinkText}>Terms of Service</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.legalLink}>
                <Text style={styles.legalLinkText}>Data Protection</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  settingsList: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  settingRight: {
    marginLeft: 12,
  },
  settingButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  settingButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  dataActions: {
    gap: 12,
  },
  dataAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dataActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataActionContent: {
    flex: 1,
  },
  dataActionTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  dataActionSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  legalLinks: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legalLink: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  legalLinkText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.primary,
  },
}); 