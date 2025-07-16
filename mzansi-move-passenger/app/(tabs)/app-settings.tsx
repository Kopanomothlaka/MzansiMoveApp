import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Globe, Moon, Sun, Palette, Volume2, Bell, Smartphone, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

export default function AppSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    sound: true,
    vibration: true,
    autoLocation: true,
    language: 'English',
    currency: 'ZAR',
    units: 'Metric',
  });

  const handleToggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleLanguageChange = () => {
    Alert.alert('Language', 'Select your preferred language', [
      { text: 'English', onPress: () => setSettings(prev => ({ ...prev, language: 'English' })) },
      { text: 'Afrikaans', onPress: () => setSettings(prev => ({ ...prev, language: 'Afrikaans' })) },
      { text: 'Zulu', onPress: () => setSettings(prev => ({ ...prev, language: 'Zulu' })) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleCurrencyChange = () => {
    Alert.alert('Currency', 'Select your preferred currency', [
      { text: 'ZAR (R)', onPress: () => setSettings(prev => ({ ...prev, currency: 'ZAR' })) },
      { text: 'USD ($)', onPress: () => setSettings(prev => ({ ...prev, currency: 'USD' })) },
      { text: 'EUR (€)', onPress: () => setSettings(prev => ({ ...prev, currency: 'EUR' })) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUnitsChange = () => {
    Alert.alert('Units', 'Select your preferred units', [
      { text: 'Metric (km)', onPress: () => setSettings(prev => ({ ...prev, units: 'Metric' })) },
      { text: 'Imperial (miles)', onPress: () => setSettings(prev => ({ ...prev, units: 'Imperial' })) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will clear all cached data. The app may take a moment to reload.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => Alert.alert('Cache Cleared', 'All cached data has been cleared successfully.'),
      },
    ]);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              darkMode: false,
              notifications: true,
              sound: true,
              vibration: true,
              autoLocation: true,
              language: 'English',
              currency: 'ZAR',
              units: 'Metric',
            });
            Alert.alert('Settings Reset', 'All settings have been reset to default values.');
          },
        },
      ]
    );
  };

  const appearanceSettings = [
    {
      id: 'darkMode',
      title: 'Dark Mode',
      subtitle: 'Use dark theme',
      icon: settings.darkMode ? Moon : Sun,
      type: 'switch',
    },
    {
      id: 'language',
      title: 'Language',
      subtitle: settings.language,
      icon: Globe,
      type: 'select',
      onPress: handleLanguageChange,
    },
    {
      id: 'currency',
      title: 'Currency',
      subtitle: settings.currency,
      icon: Palette,
      type: 'select',
      onPress: handleCurrencyChange,
    },
    {
      id: 'units',
      title: 'Units',
      subtitle: settings.units,
      icon: Smartphone,
      type: 'select',
      onPress: handleUnitsChange,
    },
  ];

  const notificationSettings = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive push notifications',
      icon: Bell,
      type: 'switch',
    },
    {
      id: 'sound',
      title: 'Sound',
      subtitle: 'Play notification sounds',
      icon: Volume2,
      type: 'switch',
    },
    {
      id: 'vibration',
      title: 'Vibration',
      subtitle: 'Vibrate on notifications',
      icon: Smartphone,
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
            style={styles.selectButton}
            onPress={setting.onPress}
          >
            <ChevronRight size={20} color={Colors.textSecondary} />
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
          <Text style={styles.title}>App Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Appearance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.settingsList}>
              {appearanceSettings.map(renderSettingItem)}
            </View>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.settingsList}>
              {notificationSettings.map(renderSettingItem)}
            </View>
          </View>

          {/* Data & Storage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Storage</Text>
            <View style={styles.dataActions}>
              <TouchableOpacity style={styles.dataAction} onPress={handleClearCache}>
                <View style={styles.dataActionIcon}>
                  <Smartphone size={20} color={Colors.primary} />
                </View>
                <View style={styles.dataActionContent}>
                  <Text style={styles.dataActionTitle}>Clear Cache</Text>
                  <Text style={styles.dataActionSubtitle}>Free up storage space</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dataAction} onPress={handleResetSettings}>
                <View style={[styles.dataActionIcon, { backgroundColor: Colors.error + '20' }]}>
                  <Smartphone size={20} color={Colors.error} />
                </View>
                <View style={styles.dataActionContent}>
                  <Text style={[styles.dataActionTitle, { color: Colors.error }]}>Reset Settings</Text>
                  <Text style={styles.dataActionSubtitle}>Reset to default values</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.aboutInfo}>
              <View style={styles.aboutItem}>
                <Text style={styles.aboutLabel}>App Version</Text>
                <Text style={styles.aboutValue}>1.0.0</Text>
              </View>
              <View style={styles.aboutItem}>
                <Text style={styles.aboutLabel}>Build Number</Text>
                <Text style={styles.aboutValue}>2025.01.12</Text>
              </View>
              <View style={styles.aboutItem}>
                <Text style={styles.aboutLabel}>Last Updated</Text>
                <Text style={styles.aboutValue}>January 12, 2025</Text>
              </View>
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
  selectButton: {
    padding: 4,
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
  aboutInfo: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aboutLabel: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  aboutValue: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
}); 