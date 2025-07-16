import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, Pressable, Animated, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, MapPin, Search, Plus, Car, Package, Clock, TrendingUp, TrendingDown, CheckCircle, RefreshCw, DollarSign, Hourglass, XCircle } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '@/constants/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentGreeting, setCurrentGreeting] = useState('');
  const [userBids, setUserBids] = useState<any[]>([]);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loadingBids, setLoadingBids] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Use useFocusEffect to re-fetch data whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchTrips();
      fetchUserName();
      fetchUserBids();
      fetchUserBookings();
    }, [])
  );

  // Function to get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 0 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  useEffect(() => {
    // Set initial greeting
    setCurrentGreeting(getGreeting());

    // Update greeting every minute to handle time changes
    const interval = setInterval(() => {
      setCurrentGreeting(getGreeting());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    setLoadingUser(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
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

  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          driver_profiles (
            first_name,
            last_name,
            rating
          )
        `)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching trips:', error);
      } else {
        setAvailableTrips(data || []);
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const fetchUserBids = async () => {
    setLoadingBids(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserBids([]);
        setLoadingBids(false);
        return;
      }
      const { data, error } = await supabase
        .from('bids')
        .select('*, trips(*)')
        .eq('rider_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        setUserBids([]);
      } else {
        setUserBids((data || []).filter(bid => bid.trips && bid.status === 'pending'));
      }
    } catch (e) {
      setUserBids([]);
    } finally {
      setLoadingBids(false);
    }
  };

  const fetchUserBookings = async () => {
    setLoadingBookings(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserBookings([]);
        setLoadingBookings(false);
        return;
      }
      const { data, error } = await supabase
        .from('bookings')
        .select('*, trips(*)')
        .eq('rider_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        setUserBookings([]);
      } else {
        setUserBookings((data || []).filter(b => b.status !== 'canceled' && b.trips));
      }
    } catch (e) {
      setUserBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const activeBids = [
    {
      id: '1',
      type: 'ride',
      route: 'Johannesburg → Pretoria',
      myBid: 120,
      currentPrice: 130,
      timeLeft: '2h 30m',
      status: 'leading'
    },
    {
      id: '2',
      type: 'package',
      route: 'Cape Town → Stellenbosch',
      myBid: 70,
      currentPrice: 80,
      timeLeft: '45m',
      status: 'outbid'
    },
  ];

  const handleTripPress = (trip: any) => {
    router.push({
      pathname: `/trip/${trip.id}`,
      params: { trip: JSON.stringify(trip) }
    });
  };

  const handleBid = () => {
    // This function can be removed or repurposed if bidding is handled on another screen
    router.push('/bids');
  };

  const handleRequest = () => {
    // This function can be removed as booking will be handled on the details page
  };

  // Filter out trips that the user has already booked (not canceled) or bid on
  const bookedTripIds = userBookings.map(b => b.trip_id);
  const biddedTripIds = userBids.map(bid => bid.trip_id);
  const filteredTrips = availableTrips.filter(trip =>
    !bookedTripIds.includes(trip.id) && !biddedTripIds.includes(trip.id) &&
    (trip.from_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.to_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.driver_profiles && `${trip.driver_profiles.first_name} ${trip.driver_profiles.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const renderTripCard = (trip: any) => (
    <TouchableOpacity key={trip.id} style={styles.tripCard} onPress={() => handleTripPress(trip)}>
      <View style={styles.tripCardHeader}>
        <View style={styles.tripType}>
          <Car size={16} color={Colors.primary} />
          <Text style={styles.tripTypeText}>
            Ride
          </Text>
        </View>
        <View style={styles.trendingIndicator}>
          <TrendingUp size={16} color={Colors.success} />
        </View>
      </View>

      <View style={styles.tripRoute}>
        <Text style={styles.tripFrom}>{trip.from_location}</Text>
        <View style={styles.routeArrow}>
          <View style={styles.arrowLine} />
          <Text style={styles.arrowText}>→</Text>
        </View>
        <Text style={styles.tripTo}>{trip.to_location}</Text>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.tripTime}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.tripTimeText}>{trip.trip_date} • {trip.trip_time}</Text>
        </View>
        <View style={styles.tripCapacity}>
          <Text style={styles.tripCapacityText}>
            {`${trip.available_seats}/${trip.total_seats} seats`}
          </Text>
        </View>
      </View>

      <View style={styles.tripFooter}>
        <View style={styles.providerInfo}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200' }}
            style={styles.providerAvatar}
          />
          <View>
            <Text style={styles.providerName}>{trip.driver_profiles ? `${trip.driver_profiles.first_name} ${trip.driver_profiles.last_name}` : 'Driver'}</Text>
            <Text style={styles.providerRating}>⭐ {trip.driver_profiles?.rating || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>R{trip.price}</Text>
          <TouchableOpacity style={styles.bidButton}>
            <Text style={styles.bidButtonText}>Bid</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render active bid cards (modern design with icons)
  const renderActiveBidCard = (bid: any) => {
    const trip = bid.trips;
    if (!trip) return null;
    // Status icon and color
    let statusIcon = <CheckCircle size={16} color={Colors.success} />;
    let statusColor = Colors.success;
    if (bid.status === 'pending') {
      statusIcon = <Hourglass size={16} color={Colors.warning} />;
      statusColor = Colors.warning;
    } else if (bid.status === 'canceled') {
      statusIcon = <XCircle size={16} color={Colors.error} />;
      statusColor = Colors.error;
    }
    return (
      <TouchableOpacity key={bid.id} style={styles.bidCardModern} onPress={() => router.push('/bids')}>
        <View style={styles.bidCardHeaderModern}>
          <View style={styles.bidTypeModern}>
            <Car size={18} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.tripTypeTextModern}>Ride</Text>
          </View>
          <View style={styles.trendingIndicatorModern}>
            <TrendingUp size={18} color={Colors.success} />
          </View>
        </View>
        <View style={styles.bidRouteRowModern}>
          <Text style={styles.bidRouteFromModern}>{trip.from_location}</Text>
          <Text style={styles.bidRouteArrowModern}>→</Text>
          <Text style={styles.bidRouteToModern}>{trip.to_location}</Text>
        </View>
        <View style={styles.bidDetailsRowModern}>
          <View style={styles.bidDetailBoxModern}>
            <DollarSign size={14} color={Colors.primary} />
            <Text style={styles.bidLabelModern}>My Bid</Text>
            <Text style={styles.bidAmountModern}>R{bid.amount}</Text>
          </View>
          <View style={styles.bidDetailBoxModern}>
            <DollarSign size={14} color={Colors.textSecondary} />
            <Text style={styles.bidLabelModern}>Current</Text>
            <Text style={styles.bidAmountModern}>R{trip.price || '-'}</Text>
          </View>
          <View style={styles.bidDetailBoxModern}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.bidLabelModern}>Time Left</Text>
            <Text style={styles.bidAmountModern}>--</Text>
          </View>
        </View>
        <View style={styles.bidStatusRowModern}>
          {statusIcon}
          <Text style={[styles.bidStatusTextModern, { color: statusColor }]}>{bid.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{loadingUser ? '' : currentGreeting}</Text>
              <Text style={styles.userName}>{loadingUser ? 'Loading...' : userName}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={24} color={Colors.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Search & New Request */}
          <View style={styles.actionsContainer}>
            <View style={styles.searchContainer}>
              <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a destination..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Active Bids Section - only show if there are active bids */}
          {!loadingBids && userBids.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Active Bids</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
                {userBids.map(renderActiveBidCard)}
              </ScrollView>
            </>
          )}

          {/* Available Trips Section */}
          <Text style={styles.sectionTitle}>Available Trips</Text>
          {loadingTrips || loadingBookings ? (
            <View style={styles.loadingContainer}><Text>Loading...</Text></View>
          ) : filteredTrips.length === 0 ? (
            <Text style={styles.emptyText}>No available trips found.</Text>
          ) : (
            filteredTrips.map(renderTripCard)
          )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: Colors.text,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
  },
  newRequestButton: {
    backgroundColor: Colors.primary,
    height: 48,
    width: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  viewAll: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.primary,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  mapButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.primary,
  },
  tripsList: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 24,
  },
  tripCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tripTypeText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  trendingIndicator: {
    padding: 6,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripFrom: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    flex: 1,
  },
  tripTo: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  routeArrow: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  arrowLine: {
    height: 1,
    width: 20,
    backgroundColor: Colors.border,
  },
  arrowText: {
    position: 'absolute',
    top: -8,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tripTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripTimeText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  tripCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripCapacityText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  providerName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  providerRating: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  minPrice: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  bidButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bidButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.heading.medium,
    color: Colors.background,
  },
  bidCardModern: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 22,
    marginRight: 16,
    marginBottom: 10,
    minWidth: 280,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bidCardHeaderModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bidTypeModern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingIndicatorModern: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidRouteRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  bidRouteFromModern: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  bidRouteArrowModern: {
    fontSize: FontSizes.base,
    color: Colors.primary,
    marginHorizontal: 2,
  },
  bidRouteToModern: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  bidDetailsRowModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  bidDetailBoxModern: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 2,
    gap: 2,
  },
  bidLabelModern: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bidAmountModern: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  bidStatusRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 6,
  },
  bidStatusTextModern: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.bold,
    textTransform: 'capitalize',
  },
  tripTypeTextModern: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
    marginLeft: 2,
  },
  availableTripsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  gradient: {
    flex: 1,
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  routeRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeTextModern: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  detailsRowModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailBoxModern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabelModern: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  detailValueModern: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
});