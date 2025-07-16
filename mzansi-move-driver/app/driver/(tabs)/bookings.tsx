import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, MapPin, ArrowRight, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { supabase } from '@/constants/supabase';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setBookings([]);
        setLoading(false);
        return;
      }

      // Fetch all trips for the current driver
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('id')
        .eq('driver_id', user.id);

      if (tripsError) {
        setBookings([]);
        setLoading(false);
        return;
      }
      
      if (!trips || trips.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const tripIds = trips.map(t => t.id);

      // Fetch all bookings for those trips
      const { data, error } = await supabase
        .from('bookings')
        .select('*, profiles:rider_id(*), trips(*)')
        .in('trip_id', tripIds)
        .order('created_at', { ascending: false });

      if (error) {
        setBookings([]);
      } else {
        setBookings(data || []);
      }
    } catch (e) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const renderBooking = (booking: any) => {
    const trip = booking.trips;
    const rider = booking.profiles;
    if (!trip || !rider) return null;

    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.riderName}>{rider.full_name || 'Rider'}</Text>
          <Text style={styles.status}>{booking.status}</Text>
        </View>
        <View style={styles.tripInfo}>
          <MapPin size={16} color={Colors.primary} />
          <Text style={styles.routeText}>{trip.from_location} <ArrowRight size={14} /> {trip.to_location}</Text>
        </View>
        <View style={styles.timeInfo}>
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.timeText}>{trip.trip_date} at {trip.trip_time}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <Text style={styles.title}>Trip Bookings</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings for your trips yet.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {bookings.map(renderBooking)}
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: FontSizes.base, color: Colors.textSecondary },
  scrollContent: { paddingBottom: 40 },
  bookingCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  riderName: { fontSize: FontSizes.lg, fontFamily: Fonts.heading.medium, color: Colors.text },
  status: { fontSize: FontSizes.sm, color: Colors.success, textTransform: 'capitalize' },
  tripInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  routeText: { fontSize: FontSizes.base, color: Colors.text },
  timeInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
}); 