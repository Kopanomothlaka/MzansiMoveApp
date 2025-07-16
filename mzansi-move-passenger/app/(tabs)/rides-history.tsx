import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Star, Calendar } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { supabase } from '@/constants/supabase';

export default function RidesHistoryScreen() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRides([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('bookings')
        .select('*, trips(*, driver_profiles(*))')
        .eq('rider_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      if (error) {
        setRides([]);
      } else {
        setRides(data || []);
      }
    } catch (e) {
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const renderRide = (booking: any) => {
    const trip = booking.trips;
    const driver = trip?.driver_profiles;
    if (!trip) return null;
    return (
      <View key={booking.id} style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <View style={styles.routeInfo}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.routeText}>{trip.from_location} → {trip.to_location}</Text>
          </View>
          <View style={styles.rideStatus}>
            <Text style={styles.statusText}>Completed</Text>
          </View>
        </View>
        <View style={styles.rideDetails}>
          <View style={styles.providerInfo}>
            {driver?.avatar_url ? (
              <Image source={{ uri: driver.avatar_url }} style={styles.providerAvatar} />
            ) : null}
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{driver?.first_name} {driver?.last_name}</Text>
              <View style={styles.providerRating}>
                <Star size={12} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.ratingText}>{driver?.rating?.toFixed(1) || 'New Driver'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rideMeta}>
            <View style={styles.metaItem}>
              <Calendar size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{trip.trip_date} at {trip.trip_time}</Text>
            </View>
          </View>
        </View>
        <View style={styles.rideFooter}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Total Paid</Text>
            <Text style={styles.priceAmount}>R{booking.amount || trip.price}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <Text style={styles.title}>Ride History</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : rides.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No completed rides found.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {rides.map(renderRide)}
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  gradient: { flex: 1, paddingHorizontal: 20, paddingTop: 32 },
  title: { fontSize: FontSizes.xl, fontFamily: Fonts.heading.bold, color: Colors.text, marginBottom: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: FontSizes.base, color: Colors.textSecondary },
  scrollContent: { paddingBottom: 40 },
  rideCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
  rideHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  routeInfo: { flexDirection: 'row', alignItems: 'center' },
  routeText: { fontSize: FontSizes.base, fontFamily: Fonts.heading.medium, color: Colors.text, marginHorizontal: 4 },
  rideStatus: { backgroundColor: Colors.success, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { color: '#fff', fontSize: FontSizes.sm },
  rideDetails: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  providerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  providerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  providerDetails: {},
  providerName: { fontSize: FontSizes.sm, color: Colors.text },
  providerRating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginLeft: 4 },
  rideMeta: { flex: 1 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaText: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginLeft: 4 },
  rideFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  priceInfo: {},
  priceLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  priceAmount: { fontSize: FontSizes.base, color: Colors.text, fontWeight: 'bold' },
}); 