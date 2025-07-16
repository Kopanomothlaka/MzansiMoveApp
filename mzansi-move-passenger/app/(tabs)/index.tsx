import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, Pressable, Animated, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, MapPin, Search, Plus, Car, Package, Clock, TrendingUp, TrendingDown, CheckCircle, RefreshCw, DollarSign, Hourglass, XCircle, Star, Filter, Navigation, Users, Calendar, Zap } from 'lucide-react-native';
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

  const handleTripPress = (trip: any) => {
    router.push({
      pathname: `/trip/${trip.id}`,
      params: { trip: JSON.stringify(trip) }
    });
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
      <LinearGradient
        colors={['rgba(37, 99, 235, 0.05)', 'rgba(59, 130, 246, 0.02)']}
        style={styles.tripCardGradient}
      >
        <View style={styles.tripCardHeader}>
          <View style={styles.tripType}>
            <View style={styles.tripTypeIcon}>
              <Car size={14} color={Colors.primary} />
            </View>
            <Text style={styles.tripTypeText}>Ride</Text>
          </View>
          <View style={styles.trendingIndicator}>
            <TrendingUp size={16} color={Colors.success} />
          </View>
        </View>

        <View style={styles.tripRoute}>
          <View style={styles.routePoint}>
            <View style={styles.fromIcon}>
              <MapPin size={12} color={Colors.success} />
            </View>
            <Text style={styles.tripFrom}>{trip.from_location}</Text>
          </View>
          <View style={styles.routeArrow}>
            <View style={styles.arrowLine} />
            <Navigation size={14} color={Colors.primary} style={styles.arrowIcon} />
          </View>
          <View style={styles.routePoint}>
            <View style={styles.toIcon}>
              <MapPin size={12} color={Colors.error} />
            </View>
            <Text style={styles.tripTo}>{trip.to_location}</Text>
          </View>
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.tripDetailItem}>
            <Calendar size={14} color={Colors.textSecondary} />
            <Text style={styles.tripTimeText}>{trip.trip_date}</Text>
          </View>
          <View style={styles.tripDetailItem}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.tripTimeText}>{trip.trip_time}</Text>
          </View>
          <View style={styles.tripDetailItem}>
            <Users size={14} color={Colors.textSecondary} />
            <Text style={styles.tripCapacityText}>
              {`${trip.available_seats}/${trip.total_seats}`}
            </Text>
          </View>
        </View>

        <View style={styles.tripFooter}>
          <View style={styles.providerInfo}>
            <View style={styles.providerAvatar}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200' }}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>
                {trip.driver_profiles ? `${trip.driver_profiles.first_name} ${trip.driver_profiles.last_name}` : 'Driver'}
              </Text>
              <View style={styles.ratingContainer}>
                <Star size={12} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.providerRating}>
                  {trip.driver_profiles?.rating || 'New'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>R{trip.price}</Text>
            <TouchableOpacity style={styles.bidButton}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.bidButtonGradient}
              >
                <DollarSign size={14} color={Colors.background} />
                <Text style={styles.bidButtonText}>Bid</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
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
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.08)', 'rgba(59, 130, 246, 0.04)']}
          style={styles.bidCardGradient}
        >
          <View style={styles.bidCardHeaderModern}>
            <View style={styles.bidTypeModern}>
              <View style={styles.bidTypeIconContainer}>
                <Car size={16} color={Colors.primary} />
              </View>
              <Text style={styles.tripTypeTextModern}>Active Bid</Text>
            </View>
            <View style={styles.trendingIndicatorModern}>
              <Zap size={16} color={Colors.warning} />
            </View>
          </View>
          
          <View style={styles.bidRouteRowModern}>
            <View style={styles.routeIconContainer}>
              <MapPin size={12} color={Colors.success} />
            </View>
            <Text style={styles.bidRouteFromModern}>{trip.from_location}</Text>
            <Navigation size={12} color={Colors.primary} style={styles.bidRouteArrowModern} />
            <Text style={styles.bidRouteToModern}>{trip.to_location}</Text>
            <View style={styles.routeIconContainer}>
              <MapPin size={12} color={Colors.error} />
            </View>
          </View>
          
          <View style={styles.bidDetailsRowModern}>
            <View style={styles.bidDetailBoxModern}>
              <DollarSign size={14} color={Colors.primary} />
              <Text style={styles.bidLabelModern}>My Bid</Text>
              <Text style={styles.bidAmountModern}>R{bid.amount}</Text>
            </View>
            <View style={styles.bidDetailBoxModern}>
              <DollarSign size={14} color={Colors.textSecondary} />
              <Text style={styles.bidLabelModern}>Listed</Text>
              <Text style={styles.bidAmountModern}>R{trip.price || '-'}</Text>
            </View>
            <View style={styles.bidDetailBoxModern}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.bidLabelModern}>Status</Text>
              <View style={styles.statusContainer}>
                {statusIcon}
                <Text style={[styles.statusTextSmall, { color: statusColor }]}>
                  {bid.status}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Enhanced Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>{loadingUser ? '' : currentGreeting}</Text>
                <View style={styles.userNameContainer}>
                  <Text style={styles.userName}>{loadingUser ? 'Loading...' : userName}</Text>
                  <View style={styles.verifiedBadge}>
                    <CheckCircle size={16} color={Colors.success} />
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell size={24} color={Colors.text} />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Search & Actions */}
          <View style={styles.actionsContainer}>
            <View style={styles.searchContainer}>
              <View style={styles.searchIconContainer}>
                <Search size={20} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Where would you like to go?"
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.filterButton}>
                <Filter size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionItem}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.quickActionGradient}
                >
                  <Car size={24} color={Colors.background} />
                </LinearGradient>
                <Text style={styles.quickActionText}>Book Ride</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionItem}>
                <LinearGradient
                  colors={[Colors.success, '#10B981']}
                  style={styles.quickActionGradient}
                >
                  <Package size={24} color={Colors.background} />
                </LinearGradient>
                <Text style={styles.quickActionText}>Send Package</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionItem}>
                <LinearGradient
                  colors={[Colors.warning, '#F59E0B']}
                  style={styles.quickActionGradient}
                >
                  <DollarSign size={24} color={Colors.background} />
                </LinearGradient>
                <Text style={styles.quickActionText}>My Bids</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionItem}>
                <LinearGradient
                  colors={[Colors.info, '#3B82F6']}
                  style={styles.quickActionGradient}
                >
                  <Clock size={24} color={Colors.background} />
                </LinearGradient>
                <Text style={styles.quickActionText}>History</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Bids Section - only show if there are active bids */}
          {!loadingBids && userBids.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderWithIcon}>
                <View style={styles.sectionTitleContainer}>
                  <Zap size={20} color={Colors.warning} />
                  <Text style={styles.sectionTitle}>Active Bids</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/bids')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
                {userBids.map(renderActiveBidCard)}
              </ScrollView>
            </View>
          )}

          {/* Available Trips Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithIcon}>
              <View style={styles.sectionTitleContainer}>
                <Navigation size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Available Trips</Text>
              </View>
              <TouchableOpacity>
                <RefreshCw size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {loadingTrips || loadingBookings ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner}>
                  <RefreshCw size={24} color={Colors.primary} />
                </View>
                <Text style={styles.loadingText}>Finding trips...</Text>
              </View>
            ) : filteredTrips.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Car size={48} color={Colors.textSecondary} />
                </View>
                <Text style={styles.emptyTitle}>No trips available</Text>
                <Text style={styles.emptyText}>Check back later for new rides</Text>
              </View>
            ) : (
              <View style={styles.tripsContainer}>
                {filteredTrips.map(renderTripCard)}
              </View>
            )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greetingContainer: {
    gap: 4,
  },
  greeting: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  verifiedBadge: {
    padding: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIconContainer: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: Colors.text,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
  },
  filterButton: {
    padding: 8,
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  viewAllText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.primary,
  },
  tripsContainer: {
    gap: 16,
  },
  tripCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tripCardGradient: {
    padding: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tripTypeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripTypeText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  trendingIndicator: {
    padding: 8,
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fromIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripFrom: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
  },
  tripTo: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
  },
  routeArrow: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
    position: 'relative',
  },
  arrowLine: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.border,
  },
  arrowIcon: {
    position: 'absolute',
    backgroundColor: Colors.background,
    padding: 4,
    borderRadius: 8,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tripDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripTimeText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
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
    gap: 12,
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  providerDetails: {
    gap: 4,
  },
  providerName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerRating: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  currentPrice: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  bidButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bidButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  bidButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.heading.medium,
    color: Colors.background,
  },
  bidCardModern: {
    borderRadius: 20,
    marginRight: 16,
    marginBottom: 10,
    minWidth: 300,
    maxWidth: 340,
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  bidCardGradient: {
    padding: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bidCardHeaderModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bidTypeModern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bidTypeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripTypeTextModern: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
  },
  trendingIndicatorModern: {
    padding: 8,
    backgroundColor: Colors.warning + '20',
    borderRadius: 12,
  },
  bidRouteRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
  },
  routeIconContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidRouteFromModern: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    flex: 1,
  },
  bidRouteArrowModern: {
    marginHorizontal: 4,
  },
  bidRouteToModern: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
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
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bidLabelModern: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontFamily: Fonts.body.regular,
  },
  bidAmountModern: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusTextSmall: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.bold,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingSpinner: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  loadingText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyIcon: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});