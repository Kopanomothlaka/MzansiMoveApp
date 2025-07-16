import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, MapPin, Clock, DollarSign, Star, Trash2, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

export default function FavoriteRoutesScreen() {
  const router = useRouter();
  const [favoriteRoutes, setFavoriteRoutes] = useState([
    {
      id: '1',
      from: 'Johannesburg',
      to: 'Pretoria',
      averagePrice: 120,
      averageTime: '45 min',
      frequency: 'Daily',
      lastUsed: '2025-01-10',
      isActive: true,
      image: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      from: 'Cape Town',
      to: 'Stellenbosch',
      averagePrice: 80,
      averageTime: '35 min',
      frequency: 'Weekly',
      lastUsed: '2025-01-08',
      isActive: true,
      image: 'https://images.pexels.com/photos/1005644/pexels-photo-1005644.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '3',
      from: 'Durban',
      to: 'Pietermaritzburg',
      averagePrice: 90,
      averageTime: '50 min',
      frequency: 'Monthly',
      lastUsed: '2025-01-05',
      isActive: false,
      image: 'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '4',
      from: 'Port Elizabeth',
      to: 'Grahamstown',
      averagePrice: 110,
      averageTime: '55 min',
      frequency: 'Occasionally',
      lastUsed: '2024-12-20',
      isActive: false,
      image: 'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ]);

  const handleQuickBook = (route: any) => {
    Alert.alert(
      'Quick Book',
      `Book a ride from ${route.from} to ${route.to}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: () => {
            Alert.alert('Booking', 'Redirecting to booking screen...');
            // Here you would navigate to the booking screen with route details
          },
        },
      ]
    );
  };

  const handleRemoveRoute = (id: string) => {
    Alert.alert(
      'Remove Route',
      'Are you sure you want to remove this route from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFavoriteRoutes(prev => prev.filter(route => route.id !== id));
            Alert.alert('Removed', 'Route has been removed from favorites.');
          },
        },
      ]
    );
  };

  const handleAddRoute = () => {
    Alert.alert('Add Route', 'This would open a form to add a new favorite route.');
  };

  const renderRouteCard = (route: any) => (
    <View key={route.id} style={styles.routeCard}>
      <View style={styles.routeHeader}>
        <View style={styles.routeInfo}>
          <View style={styles.routeIcon}>
            <Heart size={20} color={Colors.primary} fill={Colors.primary} />
          </View>
          <View style={styles.routeDetails}>
            <Text style={styles.routeText}>{route.from} → {route.to}</Text>
            <Text style={styles.routeFrequency}>{route.frequency}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveRoute(route.id)}
        >
          <Trash2 size={16} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.routeStats}>
        <View style={styles.routeStatItem}>
          <DollarSign size={14} color={Colors.textSecondary} />
          <Text style={styles.routeStatText}>R{route.averagePrice}</Text>
        </View>
        <View style={styles.routeStatItem}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.routeStatText}>{route.averageTime}</Text>
        </View>
        <View style={styles.routeStatItem}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.routeStatText}>Last: {route.lastUsed}</Text>
        </View>
      </View>

      <View style={styles.routeFooter}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: route.isActive ? Colors.success : Colors.textSecondary }]} />
          <Text style={styles.statusText}>
            {route.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, !route.isActive && styles.bookButtonDisabled]}
          onPress={() => handleQuickBook(route)}
          disabled={!route.isActive}
        >
          <LinearGradient
            colors={route.isActive ? [Colors.primary, Colors.secondary] : [Colors.border, Colors.border]}
            style={styles.bookButtonGradient}
          >
            <Text style={[styles.bookButtonText, !route.isActive && styles.bookButtonTextDisabled]}>
              Quick Book
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
          <Text style={styles.title}>Favorite Routes</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddRoute}>
            <Plus size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Overview */}
          <View style={styles.statsCard}>
            <View style={styles.statsItem}>
              <Text style={styles.statValue}>{favoriteRoutes.length}</Text>
              <Text style={styles.statLabel}>Total Routes</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statValue}>
                {favoriteRoutes.filter(route => route.isActive).length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statValue}>
                R{favoriteRoutes.reduce((sum, route) => sum + route.averagePrice, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
          </View>

          {/* Routes List */}
          <View style={styles.routesList}>
            {favoriteRoutes.map(renderRouteCard)}
          </View>

          {/* Add New Route Button */}
          <TouchableOpacity style={styles.addRouteButton} onPress={handleAddRoute}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.addRouteGradient}
            >
              <Plus size={24} color={Colors.background} />
              <Text style={styles.addRouteText}>Add New Route</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  routesList: {
    gap: 16,
    marginBottom: 32,
  },
  routeCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeDetails: {
    flex: 1,
  },
  routeText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  routeFrequency: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: 8,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  routeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStatText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  bookButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookButtonDisabled: {
    opacity: 0.5,
  },
  bookButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bookButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
  },
  bookButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  addRouteButton: {
    marginBottom: 32,
  },
  addRouteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addRouteText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
  },
}); 