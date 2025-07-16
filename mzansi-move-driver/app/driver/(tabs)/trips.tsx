import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert, Modal } from 'react-native';
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
  Phone
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

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get the driver profile to get the driver_id
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

      // Now query trips using the driver_id from driver_profiles
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('driver_id', driverProfile.user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading trips:', error);
      } else {
        // Get actual bid counts for each trip
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

      // Get driver profile to verify ownership
      const { data: driverProfile, error: profileError } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError || !driverProfile) {
        Alert.alert('Error', 'Driver profile not found');
        return;
      }

      // Check if trip is active (can only act on active trips)
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
        .eq('driver_id', driverProfile.user_id); // Ensure driver owns the trip

      if (error) {
        console.error('Error updating trip:', error);
        Alert.alert('Error', 'Failed to update trip status');
      } else {
        Alert.alert('Success', `Trip ${action}d successfully`);
        loadTrips(); // Refresh data
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
      <View style={styles.bidHeader}>
        <Text style={styles.riderName}>{item.rider_name}</Text>
        <Text style={[styles.bidStatus, { color: getBidStatusColor(item.status) }]}>
          {getBidStatusText(item.status)}
        </Text>
      </View>
      <Text style={styles.bidAmount}>R {item.bid_amount}</Text>
    </View>
  );

  const renderTripItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity 
      style={styles.tripCard}
      onPress={() => {
        setSelectedTrip(item);
        loadTripBids(item.id);
        setTripDetailsModalVisible(true);
      }}
    >
      <View style={styles.tripHeader}>
        <View style={styles.tripInfo}>
          <Text style={styles.tripDate}>{item.trip_date}</Text>
          <Text style={styles.tripTime}>{item.trip_time}</Text>
        </View>
        <View style={styles.tripStatus}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
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

        <View style={styles.routeLine} />

        <View style={styles.routePoint}>
          <View style={styles.destinationIcon}>
            <MapPin size={16} color={Colors.primary} />
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
              {`${item.available_seats}/${item.total_seats} seats available`}
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
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleTripAction(item.id, 'complete')}
            >
              <CheckCircle size={16} color={Colors.background} />
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleTripAction(item.id, 'cancel')}
            >
              <XCircle size={16} color={Colors.error} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ChevronRight size={20} color={Colors.textSecondary} style={styles.chevron} />
    </TouchableOpacity>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Trips</Text>
          <Text style={styles.headerSubtitle}>Manage your scheduled rides</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.statGradient}
            >
              <View style={styles.statContent}>
                <Text style={styles.statValue}>R{totalEarnings}</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
              </View>
              <DollarSign size={32} color={Colors.background} />
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.success, Colors.secondary]}
              style={styles.statGradient}
            >
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{totalTrips}</Text>
                <Text style={styles.statLabel}>Total Trips</Text>
              </View>
              <Car size={32} color={Colors.background} />
            </LinearGradient>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.key && styles.filterTabActive
                ]}
                onPress={() => setSelectedFilter(filter.key as 'all' | 'pending' | 'active' | 'completed' | 'cancelled')}
              >
                <Text style={[
                  styles.filterTabText,
                  selectedFilter === filter.key && styles.filterTabTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.tripsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading trips...</Text>
            </View>
          ) : filteredTrips.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No trips found</Text>
              <Text style={styles.emptySubtitle}>
                Trips matching this filter will appear here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredTrips}
              renderItem={renderTripItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={tripDetailsModalVisible}
        onRequestClose={() => setTripDetailsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedTrip && (
              <>
                <TouchableOpacity 
                  style={styles.closeModalButton} 
                  onPress={() => setTripDetailsModalVisible(false)}
                >
                  <X size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Trip Details</Text>
                <View style={styles.modalSection}>
                  <View style={styles.modalRow}>
                    <MapPin size={16} color={Colors.primary} />
                    <Text style={styles.modalText}>{selectedTrip.from_location} to {selectedTrip.to_location}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Calendar size={16} color={Colors.primary} />
                    <Text style={styles.modalText}>{selectedTrip.trip_date} at {selectedTrip.trip_time}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <DollarSign size={16} color={Colors.primary} />
                    <Text style={styles.modalText}>R {selectedTrip.price}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Users size={16} color={Colors.primary} />
                    <Text style={styles.modalText}>{selectedTrip.available_seats}/{selectedTrip.total_seats} seats available</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTrip.status) }]}>
                      <Text style={styles.statusBadgeText}>{getStatusText(selectedTrip.status)}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.modalSubtitle}>Bids for this trip</Text>
                
                {loadingBids ? (
                  <View style={styles.loadingContainer}>
                    <Text>Loading bids...</Text>
                  </View>
                ) : tripBids.length > 0 ? (
                  <FlatList
                    data={tripBids}
                    renderItem={renderBidItem}
                    keyExtractor={(item) => item.id}
                    style={styles.bidsList}
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <MessageSquare size={32} color={Colors.textSecondary} />
                    <Text style={styles.emptyText}>No bids for this trip yet.</Text>
                  </View>
                )}
              </>
            )}
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
    padding: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSizes.base,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statGradient: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
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
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
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
  },
  tripCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripDate: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  tripTime: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  tripStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    marginBottom: 4,
  },
  tripPrice: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.success,
  },
  tripRoute: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickupIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destinationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
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
    width: 2,
    height: 16,
    backgroundColor: Colors.border,
    marginLeft: 11,
    marginBottom: 8,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDetails: {
    flex: 1,
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  seatsText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  bidsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidsText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.warning,
    marginLeft: 6,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  completeButtonText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  cancelButton: {
    backgroundColor: Colors.error + '20',
  },
  cancelButtonText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.error,
  },
  chevron: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    width: '80%',
    maxHeight: '80%',
  },
  closeModalButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  modalSection: {
    marginBottom: 24,
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
  modalSubtitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  bidsList: {
    flex: 1,
  },
  statusBadge: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bidCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  riderName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
  },
  bidStatus: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
  },
  bidAmount: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
  },
}); 