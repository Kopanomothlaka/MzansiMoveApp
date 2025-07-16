import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Clock, Users, Car, User, DollarSign, Info, Shield, MessageSquare } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { supabase } from '@/constants/supabase';

export default function TripDetailsScreen() {
  const router = useRouter();
  const { trip: tripString } = useLocalSearchParams();
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [alreadyBid, setAlreadyBid] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  useEffect(() => {
    const checkBookingAndBid = async () => {
      if (!tripString) return;
      setCheckingStatus(true);
      try {
        const trip = JSON.parse(tripString as string);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setAlreadyBooked(false);
          setAlreadyBid(false);
          setCheckingStatus(false);
          return;
        }
        // Check bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id, status')
          .eq('trip_id', trip.id)
          .eq('rider_id', user.id)
          .limit(1)
          .maybeSingle();
        // Only consider it 'booked' if a booking exists and is NOT canceled
        setAlreadyBooked(!!bookings && bookings.status !== 'canceled');
        // Check bids
        const { data: bids } = await supabase
          .from('bids')
          .select('id')
          .eq('trip_id', trip.id)
          .eq('rider_id', user.id)
          .limit(1)
          .maybeSingle();
        setAlreadyBid(!!bids);
      } catch (e) {
        setAlreadyBooked(false);
        setAlreadyBid(false);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkBookingAndBid();
  }, [tripString]);

  if (!tripString) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trip data not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const trip = JSON.parse(tripString as string);
  const driver = trip && typeof trip.driver_profiles === 'object' ? trip.driver_profiles : null;

  const handleBookNow = async () => {
    if (alreadyBid) {
      Alert.alert('Not Allowed', 'You have already placed a bid for this trip. You cannot book and bid on the same trip.');
      return;
    }
    Alert.alert(
      'Confirm Booking',
      `Are you sure you want to book this trip to ${trip.to_location} for R${trip.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) {
                Alert.alert('Error', 'You must be logged in to book a trip.');
                return;
              }
              const { error } = await supabase
                .from('bookings')
                .insert({
                  trip_id: trip.id,
                  rider_id: user.id,
                  status: 'pending',
                });
              if (error) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Success', 'Your booking request has been sent to the driver!');
                router.back();
              }
            } catch (e) {
              Alert.alert('Error', 'An unexpected error occurred.');
            }
          },
        },
      ]
    );
  };

  const handlePlaceBid = () => {
    setBidModalVisible(true);
  };

  const submitBid = async () => {
    if (alreadyBooked) {
      Alert.alert('Not Allowed', 'You have already booked this trip. You cannot bid and book on the same trip.');
      return;
    }
    if (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
      Alert.alert('Invalid Bid', 'Please enter a valid bid amount.');
      return;
    }
    setBidLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to place a bid.');
        setBidLoading(false);
        return;
      }
      const { error } = await supabase
        .from('bids')
        .insert({
          trip_id: trip.id,
          rider_id: user.id,
          amount: Number(bidAmount),
          status: 'pending',
        });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Your bid has been placed!');
        setBidModalVisible(false);
        setBidAmount('');
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setBidLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{trip.from_location} to {trip.to_location}</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            {/* Route Info */}
            <View style={styles.routeCard}>
              <View style={styles.locationRow}>
                <MapPin size={20} color={Colors.primary} />
                <Text style={styles.locationText}>{trip.from_location}</Text>
              </View>
              <View style={styles.arrowContainer}>
                <View style={styles.line} />
              </View>
              <View style={styles.locationRow}>
                <MapPin size={20} color={Colors.success} />
                <Text style={styles.locationText}>{trip.to_location}</Text>
              </View>
            </View>

            {/* Trip Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trip Details</Text>
              <View style={styles.detailGrid}>
                <DetailItem icon={Clock} label="Time" value={`${trip.trip_date} at ${trip.trip_time}`} />
                <DetailItem icon={Users} label="Seats" value={`${trip.available_seats} of ${trip.total_seats} available`} />
                <DetailItem icon={Car} label="Vehicle" value={`${trip.vehicle_make || 'N/A'} ${trip.vehicle_model || ''}`} />
                <DetailItem icon={Info} label="License" value={trip.license_plate || 'N/A'} />
              </View>
            </View>

            {/* Driver Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Driver</Text>
              <View style={styles.driverCard}>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200' }}
                  style={styles.driverAvatar}
                />
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{driver && driver.first_name && driver.last_name ? `${driver.first_name} ${driver.last_name}` : 'Driver details not available'}</Text>
                  <Text style={styles.driverRating}>⭐ {driver && typeof driver.rating === 'number' ? driver.rating.toFixed(1) : 'New Driver'}</Text>
                </View>
                <TouchableOpacity style={styles.messageButton} disabled={!driver}>
                  <MessageSquare size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Description Section */}
            {trip.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <Text style={styles.descriptionText}>{trip.description}</Text>
              </View>
            )}

            {checkingStatus ? (
              <View style={{ padding: 16 }}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : alreadyBooked ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: Colors.success, fontWeight: 'bold', fontSize: 16 }}>You have booked this trip.</Text>
              </View>
            ) : alreadyBid ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 16 }}>You have already placed a bid for this trip.</Text>
              </View>
            ) : null}

          </View>
        </ScrollView>
        
        {/* Action Buttons Footer */}
        {!checkingStatus && !alreadyBooked && !alreadyBid && (
          <View style={styles.footer}>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Listed Price</Text>
              <Text style={styles.priceValue}>R{trip.price}</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.bidButton} onPress={handlePlaceBid}>
                <Text style={styles.bidButtonText}>Place a Bid</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.bookButtonGradient}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* Bid Modal */}
        <Modal
          visible={bidModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setBidModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <View style={{ backgroundColor: Colors.background, borderRadius: 16, padding: 24, width: '80%' }}>
              <Text style={{ fontSize: FontSizes.lg, fontFamily: Fonts.heading.bold, marginBottom: 16 }}>Place Your Bid</Text>
              <Text style={{ marginBottom: 8 }}>Enter your bid amount for this trip:</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: FontSizes.base }}
                placeholder="Enter amount (e.g. 120)"
                keyboardType="numeric"
                value={bidAmount}
                onChangeText={setBidAmount}
                editable={!bidLoading}
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: Colors.surface, padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }}
                  onPress={() => setBidModalVisible(false)}
                  disabled={bidLoading}
                >
                  <Text style={{ color: Colors.text }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: Colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' }}
                  onPress={submitBid}
                  disabled={bidLoading}
                >
                  {bidLoading ? <ActivityIndicator color={Colors.background} /> : <Text style={{ color: Colors.background, fontWeight: 'bold' }}>Submit Bid</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
  <View style={styles.detailItem}>
    <Icon size={20} color={Colors.textSecondary} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  gradient: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: FontSizes.lg, color: Colors.error, marginBottom: 16 },
  linkText: { fontSize: FontSizes.base, color: Colors.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: FontSizes.lg, fontFamily: Fonts.heading.medium, color: Colors.text, flex: 1, textAlign: 'center' },
  content: { paddingHorizontal: 20 },
  routeCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 24 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locationText: { fontSize: FontSizes.base, fontFamily: Fonts.body.medium, color: Colors.text },
  arrowContainer: { paddingLeft: 10, marginVertical: 4 },
  line: { width: 2, height: 20, backgroundColor: Colors.border },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: FontSizes.lg, fontFamily: Fonts.heading.bold, color: Colors.text, marginBottom: 16 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', width: '48%', gap: 8, backgroundColor: Colors.surface, padding: 12, borderRadius: 12 },
  detailTextContainer: { flex: 1 },
  detailLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 2 },
  detailValue: { fontSize: FontSizes.sm, fontFamily: Fonts.body.medium, color: Colors.text },
  driverCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 16, gap: 12 },
  driverAvatar: { width: 50, height: 50, borderRadius: 25 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: FontSizes.base, fontFamily: Fonts.heading.medium, color: Colors.text },
  driverRating: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  messageButton: { padding: 8, backgroundColor: Colors.primary + '20', borderRadius: 20 },
  descriptionText: { fontSize: FontSizes.base, color: Colors.textSecondary, lineHeight: 22 },
  footer: { borderTopWidth: 1, borderTopColor: Colors.border, padding: 20, backgroundColor: Colors.background },
  priceInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  priceLabel: { fontSize: FontSizes.base, color: Colors.textSecondary },
  priceValue: { fontSize: FontSizes.xl, fontFamily: Fonts.heading.bold, color: Colors.text },
  buttonRow: { flexDirection: 'row', gap: 12 },
  bidButton: { flex: 1, backgroundColor: Colors.surface, paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  bidButtonText: { fontSize: FontSizes.base, fontFamily: Fonts.body.medium, color: Colors.text },
  bookButton: { flex: 1.5, borderRadius: 12, overflow: 'hidden' },
  bookButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  bookButtonText: { fontSize: FontSizes.base, fontFamily: Fonts.body.medium, color: Colors.background },
}); 