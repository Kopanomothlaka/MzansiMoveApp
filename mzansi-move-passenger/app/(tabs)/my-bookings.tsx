import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { supabase } from '@/constants/supabase';
import { MapPin, Clock, Car, ArrowRight, Hourglass, CheckCircle, XCircle } from 'lucide-react-native';

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      const { data, error } = await supabase
        .from('bookings')
        .select('*, trips!left(*)')
        .eq('rider_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        Alert.alert('Supabase Error', error.message);
        setBookings([]);
      } else if (data && data.length === 0) {
        Alert.alert('No bookings found', 'Query returned no results.');
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

  const handleCancelBooking = async (booking: any) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            const { error } = await supabase.rpc('cancel_booking_and_update_trip', {
              p_booking_id: booking.id,
            });
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              fetchBookings();
              Alert.alert('Success', 'Your booking has been canceled.');
            }
          } catch (e) {
            Alert.alert('Error', 'An unexpected error occurred.');
          }
        }
      }
    ]);
  };

  const renderBooking = (booking: any) => {
    const trip = booking.trips;
    if (!trip) {
      return (
        <View key={booking.id} style={styles.bookingCard}>
          <Text style={{ color: 'red' }}>Trip details not available for this booking.</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        key={booking.id}
        style={styles.bookingCardModern}
        onPress={() => router.push({ pathname: `/trip/${trip.id}`, params: { trip: JSON.stringify(trip) } })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.routeRow}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.routeText} numberOfLines={1}>{trip.from_location} <ArrowRight size={14} color={Colors.textSecondary} /> {trip.to_location}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(booking.status).backgroundColor }]}>
            {getStatusIcon(booking.status)}
            <Text style={[styles.statusValue, { color: getStatusStyle(booking.status).color }]}>{booking.status}</Text>
          </View>
        </View>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{trip.trip_date || 'N/A'} at {trip.trip_time || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Car size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{trip.vehicle_make || ''} {trip.vehicle_model || ''}</Text>
          </View>
        </View>

        {['pending', 'confirmed'].includes(booking.status) && (
          <TouchableOpacity style={styles.cancelButtonModern} onPress={() => handleCancelBooking(booking)}>
            <XCircle size={16} color={Colors.error} />
            <Text style={styles.cancelButtonTextModern}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Hourglass size={12} color={Colors.warning} style={{ marginRight: 4 }} />;
      case 'confirmed':
        return <CheckCircle size={12} color={Colors.success} style={{ marginRight: 4 }} />;
      case 'canceled':
        return <XCircle size={12} color={Colors.error} style={{ marginRight: 4 }} />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: Colors.warning, backgroundColor: Colors.warning + '20' };
      case 'confirmed':
        return { color: Colors.success, backgroundColor: Colors.success + '20' };
      case 'canceled':
        return { color: Colors.error, backgroundColor: Colors.error + '20' };
      default:
        return { color: Colors.textSecondary, backgroundColor: Colors.border };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <Text style={styles.title}>My Bookings</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have no bookings yet.</Text>
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: FontSizes.base, color: Colors.textSecondary },
  scrollContent: { paddingBottom: 40 },
  bookingCardModern: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  routeText: { fontSize: FontSizes.base, fontFamily: Fonts.heading.medium, color: Colors.text, marginLeft: 8, flexShrink: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusValue: { fontSize: FontSizes.sm, fontFamily: Fonts.body.bold, textTransform: 'capitalize' },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  cancelButtonModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: Colors.error + '20',
    padding: 10,
    borderRadius: 8,
  },
  cancelButtonTextModern: {
    color: Colors.error,
    fontWeight: 'bold',
    marginLeft: 6,
  },
}); 