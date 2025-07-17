import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert, Modal, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Car, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Calendar,
  Filter,
  ChevronRight,
  Users,
  CheckCircle,
  XCircle,
  MessageSquare,
  X,
  User,
  Phone,
  Navigation,
  Zap,
  TrendingUp,
  Award,
  Target
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { supabase } from '@/constants/supabase';

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  trip_date: string;
  trip_time: string;
  price: number;
  available_seats: number;
  total_seats: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  description?: string;
  bids_count?: number;
  created_at: string;
}

interface Bid {
  id: string;
  trip_id: string;
  rider_id: string;
  rider_name: string;
  rider_phone?: string;
  rider_email?: string;
  bid_amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
}

export default function DriverTrips() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'cancelled'>('all');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripDetailsModalVisible, setTripDetailsModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripBids, setTripBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [tripBooking, setTripBooking] = useState<any>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: driverProfile, error: profileError } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading driver profile:', profileError);
        return;
      }

      if (!driverProfile) {
        console.log('No driver profile found');
        return;
      }

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('driver_id', driverProfile.user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading trips:', error);
      } else {
        const tripsWithBids = await Promise.all(
          (data || []).map(async (trip) => {
            const { count: bidsCount } = await supabase
              .from('bids')
              .select('*', { count: 'exact', head: true })
              .eq('trip_id', trip.id);
            
            return {
              ...trip,
              bids_count: bidsCount || 0
            };
          })
        );
        
        setTrips(tripsWithBids);
        calculateStats(tripsWithBids);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tripsData: Trip[]) => {
    const completedTrips = tripsData.filter(trip => trip.status === 'completed');
    const earnings = completedTrips.reduce((sum, trip) => sum + trip.price, 0);
    
    setTotalEarnings(earnings);
    setTotalTrips(tripsData.length);
  };

  const handleTripAction = async (tripId: string, action: 'complete' | 'cancel') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const { data: driverProfile, error: profileError } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError || !driverProfile) {
        Alert.alert('Error', 'Driver profile not found');
        return;
      }

      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('status')
        .eq('id', tripId)
        .eq('driver_id', driverProfile.user_id)
        .single();

      if (tripError || !trip) {
        Alert.alert('Error', 'Trip not found');
        return;
      }

      if (trip.status !== 'active') {
        Alert.alert('Error', 'Can only complete or cancel active trips');
        return;
      }

      const { error } = await supabase
        .from('trips')
        .update({ status: action === 'complete' ? 'completed' : 'cancelled' })
        .eq('id', tripId)
        .eq('driver_id', driverProfile.user_id);

      if (error) {
        console.error('Error updating trip:', error);
        Alert.alert('Error', 'Failed to update trip status');
      } else {
        Alert.alert('Success', `Trip ${action}d successfully`);
        loadTrips();
      }
    } catch (error) {
      console.error('Error in handleTripAction:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.warning;
      case 'active':
        return Colors.success;
      case 'completed':
        return Colors.primary;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'active':
        return Zap;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.warning;
      case 'accepted':
        return Colors.success;
      case 'rejected':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getBidStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (selectedFilter === 'all') return true;
    return trip.status === selectedFilter;
  });

  const renderBidItem = ({ item }: { item: Bid }) => (
    <View style={styles.bidCard}>
      <LinearGradient
        colors={['rgba(37,99,235,0.05)', 'rgba(59,130,246,0.02)']}
        style={styles.bidCardGradient}
      >
        <View style={styles.bidHeader}>
          <View style={styles.riderInfo}>
            <View style={styles.riderAvatar}>
              <User size={16} color={Colors.primary} />
            </View>
            <Text style={styles.riderName}>{item.rider_name}</Text>
          </View>
          <View style={[styles.bidStatusBadge, { backgroundColor: getBidStatusColor(item.status) + '20' }]}>
            <Text style={[styles.bidStatus, { color: getBidStatusColor(item.status) }]}>
              {getBidStatusText(item.status)}
            </Text>
          </View>
        </View>
        <View style={styles.bidAmount}>
          <DollarSign size={16} color={Colors.success} />
          <Text style={styles.bidAmountText}>R {item.bid_amount}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const handleOpenTripDetails = (item: Trip) => {
    setSelectedTrip(item);
    loadTripBids(item.id);
    loadTripBooking(item.id);
    setTripDetailsModalVisible(true);
  };

  const renderTripItem = ({ item }: { item: Trip }) => {
    const StatusIcon = getStatusIcon(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.tripCard}
        onPress={() => handleOpenTripDetails(item)}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={styles.tripCardGradient}
        >
          <View style={styles.tripHeader}>
            <View style={styles.tripInfo}>
              <View style={styles.tripDateContainer}>
                <Calendar size={16} color={Colors.primary} />
                <Text style={styles.tripDate}>{item.trip_date}</Text>
              </View>
              <Text style={styles.tripTime}>{item.trip_time}</Text>
            </View>
            <View style={styles.tripStatus}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <StatusIcon size={12} color={getStatusColor(item.status)} />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
              <Text style={styles.tripPrice}>R{item.price}</Text>
            </View>
          </View>

          <View style={styles.tripRoute}>
            <View style={styles.routePoint}>
              <View style={styles.pickupIcon}>
                <MapPin size={16} color={Colors.success} />
              </View>
              <View style={styles.routeText}>
                <Text style={styles.routeLabel}>From</Text>
                <Text style={styles.routeAddress}>{item.from_location}</Text>
              </View>
            </View>

            <View style={styles.routeLine}>
              <Navigation size={16} color={Colors.primary} />
            </View>

            <View style={styles.routePoint}>
              <View style={styles.destinationIcon}>
                <MapPin size={16} color={Colors.error} />
              </View>
              <View style={styles.routeText}>
                <Text style={styles.routeLabel}>To</Text>
                <Text style={styles.routeAddress}>{item.to_location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tripFooter}>
            <View style={styles.tripDetails}>
              <View style={styles.seatsInfo}>
                <Users size={16} color={Colors.textSecondary} />
                <Text style={styles.seatsText}>
                  {`${item.available_seats}/${item.total_seats} seats`}
                </Text>
              </View>
              {item.bids_count && item.bids_count > 0 && (
                <View style={styles.bidsInfo}>
                  <MessageSquare size={16} color={Colors.warning} />
                  <Text style={styles.bidsText}>{`${item.bids_count} bids`}</Text>
                </View>
              )}
            </View>

            {item.status === 'active' && (
              <View style={styles.tripActions}>
                <TouchableOpacity 
                  style={styles.completeButton}
                  onPress={() => handleTripAction(item.id, 'complete')}
                >
                  <LinearGradient
                    colors={[Colors.success, Colors.emerald]}
                    style={styles.actionButtonGradient}
                  >
                    <CheckCircle size={14} color={Colors.background} />
                    <Text style={styles.completeButtonText}>Complete</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => handleTripAction(item.id, 'cancel')}
                >
                  <View style={styles.cancelButtonContent}>
                    <XCircle size={14} color={Colors.error} />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <ChevronRight size={20} color={Colors.textSecondary} style={styles.chevron} />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const loadTripBids = async (tripId: string) => {
    setLoadingBids(true);
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading bids:', error);
        Alert.alert('Error', 'Failed to load bids');
      } else {
        setTripBids(data || []);
      }
    } catch (error) {
      console.error('Error loading bids:', error);
      Alert.alert('Error', 'Failed to load bids');
    } finally {
      setLoadingBids(false);
    }
  };

  const loadTripBooking = async (tripId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, profiles:rider_id(*)')
        .eq('trip_id', tripId)
        .in('status', ['pending', 'accepted']) // Show both pending and accepted bookings
        .single();
      if (!error && data) setTripBooking(data);
      else setTripBooking(null);
    } catch {
      setTripBooking(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredTrips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tripsList}
        ListHeaderComponent={
          <>
            {/* Enhanced Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    style={styles.headerIconGradient}
                  >
                    <Car size={24} color={Colors.background} />
                  </LinearGradient>
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>Your Trips</Text>
                  <Text style={styles.headerSubtitle}>Manage your scheduled rides</Text>
                </View>
              </View>
            </View>

            {/* Enhanced Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.statGradient}
                >
                  <View style={styles.statContent}>
                    <View style={styles.statIconContainer}>
                      <DollarSign size={24} color={Colors.background} />
                    </View>
                    <Text style={styles.statValue}>R{totalEarnings}</Text>
                    <Text style={styles.statLabel}>Total Earnings</Text>
                  </View>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={[Colors.success, Colors.emerald]}
                  style={styles.statGradient}
                >
                  <View style={styles.statContent}>
                    <View style={styles.statIconContainer}>
                      <TrendingUp size={24} color={Colors.background} />
                    </View>
                    <Text style={styles.statValue}>{totalTrips}</Text>
                    <Text style={styles.statLabel}>Total Trips</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Enhanced Filter */}
            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterContent}>
                  {[
                    { key: 'all', label: 'All', icon: Target },
                    { key: 'pending', label: 'Pending', icon: Clock },
                    { key: 'active', label: 'Active', icon: Zap },
                    { key: 'completed', label: 'Completed', icon: CheckCircle },
                    { key: 'cancelled', label: 'Cancelled', icon: XCircle }
                  ].map((filter) => {
                    const FilterIcon = filter.icon;
                    return (
                      <TouchableOpacity
                        key={filter.key}
                        style={[
                          styles.filterTab,
                          selectedFilter === filter.key && styles.filterTabActive
                        ]}
                        onPress={() => setSelectedFilter(filter.key as 'all' | 'pending' | 'active' | 'completed' | 'cancelled')}
                      >
                        <LinearGradient
                          colors={selectedFilter === filter.key ? 
                            [Colors.primary, Colors.secondary] : 
                            ['transparent', 'transparent']
                          }
                          style={styles.filterTabGradient}
                        >
                          <FilterIcon 
                            size={16} 
                            color={selectedFilter === filter.key ? Colors.background : Colors.textSecondary} 
                          />
                          <Text style={[
                            styles.filterTabText,
                            selectedFilter === filter.key && styles.filterTabTextActive
                          ]}>
                            {filter.label}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading trips...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <LinearGradient
                  colors={[Colors.textSecondary + '20', Colors.textSecondary + '10']}
                  style={styles.emptyIconGradient}
                >
                  <MessageSquare size={48} color={Colors.textSecondary} />
                </LinearGradient>
              </View>
              <Text style={styles.emptyTitle}>No trips found</Text>
              <Text style={styles.emptySubtitle}>
                Trips matching this filter will appear here.
              </Text>
            </View>
          )
        }
      />

      {/* Enhanced Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={tripDetailsModalVisible}
        onRequestClose={() => setTripDetailsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[Colors.background, Colors.surface]}
              style={styles.modalGradient}
            >
              {selectedTrip && (
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleContainer}>
                      <View style={styles.modalIcon}>
                        <Car size={20} color={Colors.primary} />
                      </View>
                      <Text style={styles.modalTitle}>Trip Details</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.closeModalButton} 
                      onPress={() => setTripDetailsModalVisible(false)}
                    >
                      <X size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Trip Information */}
                  <View style={styles.modalSection}>
                    <View style={styles.modalRow}>
                      <MapPin size={16} color={Colors.primary} />
                      <Text style={styles.modalText}>
                        {selectedTrip.from_location} to {selectedTrip.to_location}
                      </Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Calendar size={16} color={Colors.primary} />
                      <Text style={styles.modalText}>
                        {selectedTrip.trip_date} at {selectedTrip.trip_time}
                      </Text>
                    </View>
                    <View style={styles.modalRow}>
                      <DollarSign size={16} color={Colors.primary} />
                      <Text style={styles.modalText}>R {selectedTrip.price}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Users size={16} color={Colors.primary} />
                      <Text style={styles.modalText}>
                        {selectedTrip.available_seats}/{selectedTrip.total_seats ?? 0} seats available
                      </Text>
                    </View>
                    <View style={styles.modalRow}>
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: getStatusColor(selectedTrip.status) + '20' }
                      ]}>
                        <Text style={[
                          styles.statusBadgeText, 
                          { color: getStatusColor(selectedTrip.status) }
                        ]}>
                          {getStatusText(selectedTrip.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Rider Who Booked This Trip */}
                  <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Rider Who Booked This Trip</Text>
                    {tripBooking && tripBooking.profiles ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {tripBooking.profiles.avatar_url ? (
                          <Image
                            source={{ uri: tripBooking.profiles.avatar_url }}
                            style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                          />
                        ) : null}
                        <View>
                          <Text style={{ fontSize: 15, fontWeight: '600' }}>{tripBooking.profiles.first_name} {tripBooking.profiles.last_name}</Text>
                          {tripBooking.profiles.email ? (
                            <Text style={{ color: '#555' }}>{tripBooking.profiles.email}</Text>
                          ) : null}
                          {tripBooking.profiles.phone ? (
                            <Text style={{ color: '#555' }}>{tripBooking.profiles.phone}</Text>
                          ) : null}
                        </View>
                      </View>
                    ) : (
                      <Text style={{ color: '#888' }}>No one has booked this trip yet.</Text>
                    )}
                  </View>

                  {/* Bids Section */}
                  <View style={styles.bidsSection}>
                    <View style={styles.bidsSectionHeader}>
                      <Award size={16} color={Colors.warning} />
                      <Text style={styles.modalSubtitle}>Bids for this trip</Text>
                    </View>
                    {loadingBids ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={Colors.primary} />
                        <Text style={styles.loadingText}>Loading bids...</Text>
                      </View>
                    ) : tripBids.length > 0 ? (
                      <FlatList
                        data={tripBids}
                        renderItem={renderBidItem}
                        keyExtractor={(item) => item.id}
                        style={styles.bidsList}
                        showsVerticalScrollIndicator={false}
                      />
                    ) : (
                      <View style={styles.emptyBidsContainer}>
                        <MessageSquare size={32} color={Colors.textSecondary} />
                        <Text style={styles.emptyText}>No bids for this trip yet.</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              )}
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 16,
  },
  headerIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statGradient: {
    padding: 20,
  },
  statContent: {
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: FontSizes['2xl'],
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
    opacity: 0.9,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  filterContent: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  filterTabText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.background,
  },
  tripsContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  tripsList: {
    paddingBottom: 20,
  },
  tripCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tripCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tripInfo: {
    flex: 1,
  },
  tripDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tripDate: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
  },
  tripTime: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  tripStatus: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
  },
  tripPrice: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.success,
  },
  tripRoute: {
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickupIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destinationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeText: {
    flex: 1,
  },
  routeLabel: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  routeLine: {
    alignItems: 'center',
    marginVertical: 8,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDetails: {
    flex: 1,
    gap: 8,
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seatsText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  bidsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bidsText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.warning,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 8,
  },
  completeButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  completeButtonText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  cancelButton: {
    borderRadius: 8,
    backgroundColor: Colors.error + '20',
  },
  cancelButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  cancelButtonText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.error,
  },
  chevron: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyIconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  closeModalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  modalText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    flex: 1,
  },
  statusBadgeText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
  },
  bidsSection: {
    flex: 1,
    padding: 20,
  },
  bidsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  bidsList: {
    flex: 1,
  },
  bidCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  bidCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riderAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
  },
  riderPhone: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  bidStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bidStatus: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    textTransform: 'capitalize',
  },
  bidAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bidAmountText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.success,
  },
  emptyBidsContainer: {
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});