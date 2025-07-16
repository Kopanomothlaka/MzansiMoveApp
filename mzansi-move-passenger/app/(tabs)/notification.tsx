import * as React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Gavel, MessageCircle, Info } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

const notifications = [
  {
    id: '1',
    type: 'bid',
    title: 'Bid Accepted',
    message: 'Your bid for Johannesburg → Pretoria was accepted!',
    time: '2m ago',
    icon: Gavel,
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Thabo Nkosi: Can we meet at 10am?',
    time: '10m ago',
    icon: MessageCircle,
  },
  {
    id: '3',
    type: 'system',
    title: 'Welcome to MzansiMove',
    message: 'Thanks for joining! Start your first trip today.',
    time: '1h ago',
    icon: Info,
  },
  {
    id: '4',
    type: 'bid',
    title: 'Outbid',
    message: 'Someone outbid you on Cape Town → Stellenbosch.',
    time: 'Yesterday',
    icon: Gavel,
  },
];

export default function NotificationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <View style={styles.header}>
          <Bell size={28} color={Colors.primary} />
          <Text style={styles.title}>Notifications</Text>
        </View>
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <View style={styles.notificationItem}>
              <View style={[styles.iconContainer, item.type === 'bid' && { backgroundColor: Colors.primary }, item.type === 'message' && { backgroundColor: Colors.info }, item.type === 'system' && { backgroundColor: Colors.warning }]}
              >
                <item.icon size={20} color={Colors.background} />
              </View>
              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
              </View>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <Text style={styles.sectionHeader}>Today</Text>
          )}
          ListFooterComponent={() => (
            <Text style={styles.sectionHeader}>Earlier</Text>
          )}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
  },
  sectionHeader: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontFamily: Fonts.body.medium,
    marginVertical: 12,
    marginLeft: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: Colors.primary,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontFamily: Fonts.body.regular,
  },
  notificationTime: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontFamily: Fonts.body.regular,
    marginLeft: 8,
  },
}); 