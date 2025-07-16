import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, MapPin, ArrowRight, Tag } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { supabase } from '@/constants/supabase';

export default function BidsScreen() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setBids([]);
        setLoading(false);
        return;
      }

      // Fetch all trips for the current driver
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('id')
        .eq('driver_id', user.id);

      if (tripsError) {
        setBids([]);
        setLoading(false);
        return;
      }

      const tripIds = trips.map(t => t.id);

      // Fetch all bids for those trips
      const { data, error } = await supabase
        .from('bids')
        .select('*, profiles:rider_id(*), trips(*)')
        .in('trip_id', tripIds)
        .order('created_at', { ascending: false });

      if (error) {
        setBids([]);
      } else {
        setBids(data || []);
      }
    } catch (e) {
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  const renderBid = (bid: any) => {
    const trip = bid.trips;
    const rider = bid.profiles;
    if (!trip || !rider) return null;

    return (
      <View key={bid.id} style={styles.bidCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.riderName}>{rider.full_name || 'Rider'}</Text>
          <Text style={styles.status}>{bid.status}</Text>
        </View>
        <View style={styles.tripInfo}>
          <MapPin size={16} color={Colors.primary} />
          <Text style={styles.routeText}>{trip.from_location} <ArrowRight size={14} /> {trip.to_location}</Text>
        </View>
        <View style={styles.bidInfo}>
          <Tag size={16} color={Colors.primary} />
          <Text style={styles.bidAmount}>Bid Amount: R{bid.amount}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <Text style={styles.title}>Trip Bids</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : bids.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bids for your trips yet.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {bids.map(renderBid)}
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
  bidCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  riderName: { fontSize: FontSizes.lg, fontFamily: Fonts.heading.medium, color: Colors.text },
  status: { fontSize: FontSizes.sm, color: Colors.warning, textTransform: 'capitalize' },
  tripInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  routeText: { fontSize: FontSizes.base, color: Colors.text },
  bidInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bidAmount: { fontSize: FontSizes.base, color: Colors.text, fontWeight: 'bold' },
}); 