import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Car, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Settings, 
  Bell,
  Play,
  Pause,
  Navigation,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Calendar
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { supabase } from '@/constants/supabase';

const { width } = Dimensions.get('window');

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  const [rating, setRating] = useState(4.8);
  const [currentGreeting, setCurrentGreeting] = useState('');
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [tripForm, setTripForm] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    price: '',
    seats: '4',
    description: ''
  });

  useEffect(() => {
    loadDriverData();
    setCurrentGreeting(getGreeting());
  }, []);

  const loadDriverData = async () => {
    try {
      console.log('Loading driver data...');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('User found:', user.id);
        const { data: profile } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          console.log('Driver profile loaded:', profile);
          setDriverProfile(profile);
          // Mock data - in real app, fetch from database
          setTodayEarnings(450);
          setTotalTrips(127);
        } else {
          console.log('No driver profile found');
        }
      } else {
        console.log('No user found');
      }
    } catch (error) {
      console.error('Error loading driver data:', error);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    Alert.alert(
      isOnline ? 'Going Offline' : 'Going Online',
      isOnline ? 'You are now offline and won\'t receive trip requests.' : 'You are now online and ready to accept trips!'
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const handleCreateTrip = async () => {
    if (!tripForm.from || !tripForm.to || !tripForm.date || !tripForm.time || !tripForm.price || !tripForm.seats) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate price
    const price = parseFloat(tripForm.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    // Validate seats
    const seats = parseInt(tripForm.seats);
    if (isNaN(seats) || seats <= 0 || seats > 10) {
      Alert.alert('Error', 'Please enter a valid number of seats (1-10)');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(tripForm.date)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format (e.g., 2024-12-25)');
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(tripForm.time)) {
      Alert.alert('Error', 'Please enter time in HH:MM format (e.g., 14:30)');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Ensure we have a driver profile
      if (!driverProfile) {
        Alert.alert('Error', 'Driver profile not found. Please complete your profile first.');
        return;
      }

      // Insert trip into database
      const { data, error } = await supabase
        .from('trips')
        .insert([
          {
            driver_id: driverProfile.user_id, // Use the driver profile's user_id
            from_location: tripForm.from.trim(),
            to_location: tripForm.to.trim(),
            trip_date: tripForm.date.trim(),
            trip_time: tripForm.time.trim(),
            price: price,
            available_seats: seats,
            total_seats: seats,
            description: tripForm.description.trim() || null,
            status: 'pending', // Set as pending until rider accepts or bids
            vehicle_make: driverProfile?.vehicle_make || null,
            vehicle_model: driverProfile?.vehicle_model || null,
            license_plate: driverProfile?.license_plate || null
          }
        ])
        .select();

      if (error) {
        console.error('Error creating trip:', error);
        Alert.alert('Error', 'Failed to create trip. Please try again.');
      } else {
        Alert.alert(
          'Success', 
          'Trip created successfully! Your trip is now pending and waiting for riders to accept or bid on it.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowCreateTripModal(false);
                setTripForm({
                  from: '',
                  to: '',
                  date: '',
                  time: '',
                  price: '',
                  seats: '4',
                  description: ''
                });
                // Refresh trip data
                loadDriverData();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0].substring(0, 5);
  };

  const setCurrentDateTime = () => {
    setTripForm({
      ...tripForm,
      date: getCurrentDate(),
      time: getCurrentTime()
    });
  };

  const recentTrips = [
    {
      id: '1',
      passenger: 'Sarah M.',
      route: 'Sandton → Rosebank',
      fare: 85,
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      passenger: 'John D.',
      route: 'Melrose → Hyde Park',
      fare: 65,
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: '3',
      passenger: 'Lisa K.',
      route: 'Fourways → Montecasino',
      fare: 120,
      time: '6 hours ago',
      status: 'completed'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{currentGreeting},</Text>
            <Text style={styles.driverName}>
              {`${driverProfile?.first_name || 'Driver'} ${driverProfile?.last_name || ''}`}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => Alert.alert('Notifications', 'Notifications feature coming soon')}
            >
              <Bell size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => Alert.alert('Settings', 'Settings feature coming soon')}
            >
              <Settings size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Online Status Card */}
        <TouchableOpacity style={styles.statusCard} onPress={toggleOnlineStatus}>
          <LinearGradient
            colors={isOnline ? [Colors.primary, Colors.secondary] : [Colors.surface, Colors.surface]}
            style={styles.statusGradient}
          >
            <View style={styles.statusContent}>
              <View style={styles.statusInfo}>
                <View style={styles.statusHeader}>
                  <Text style={styles.statusText}>
                    {isOnline ? 'You\'re Online' : 'You\'re Offline'}
                  </Text>
                  {isOnline && <CheckCircle size={20} color={Colors.background} />}
                </View>
                <Text style={styles.statusSubtext}>
                  {isOnline ? 'Ready to accept trips' : 'Tap to go online'}
                </Text>
              </View>
              <View style={[styles.statusButton, isOnline && styles.statusButtonOnline]}>
                {isOnline ? (
                  <Pause size={24} color={Colors.background} />
                ) : (
                  <Play size={24} color={Colors.primary} />
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Create Trip Button */}
        <TouchableOpacity 
          style={styles.createTripButton} 
          onPress={() => setShowCreateTripModal(true)}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.createTripGradient}
          >
            <Plus size={24} color={Colors.background} />
            <Text style={styles.createTripText}>Create New Trip</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <DollarSign size={24} color={Colors.success} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>R{todayEarnings}</Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
              <View style={styles.statTrend}>
                <TrendingUp size={14} color={Colors.success} />
                <Text style={styles.statTrendText}>+12%</Text>
              </View>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Car size={24} color={Colors.primary} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{totalTrips}</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
              <View style={styles.statTrend}>
                <TrendingUp size={14} color={Colors.success} />
                <Text style={styles.statTrendText}>+5 today</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Star size={24} color={Colors.warning} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
              <View style={styles.statTrend}>
                <Star size={14} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.statTrendText}>127 reviews</Text>
              </View>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Clock size={24} color={Colors.secondary} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>8.5h</Text>
              <Text style={styles.statLabel}>Online Today</Text>
              <View style={styles.statTrend}>
                <Clock size={14} color={Colors.secondary} />
                <Text style={styles.statTrendText}>Active now</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Navigation', 'Navigation feature coming soon')}
            >
              <View style={styles.actionIcon}>
                <Navigation size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionText}>Navigation</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Set Location', 'Location setting feature coming soon')}
            >
              <View style={styles.actionIcon}>
                <MapPin size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.actionText}>Set Location</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Vehicle Info', 'Vehicle information feature coming soon')}
            >
              <View style={styles.actionIcon}>
                <Car size={24} color={Colors.success} />
              </View>
              <Text style={styles.actionText}>Vehicle Info</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Preferences', 'Preferences feature coming soon')}
            >
              <View style={styles.actionIcon}>
                <Settings size={24} color={Colors.warning} />
              </View>
              <Text style={styles.actionText}>Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          
          {recentTrips.map((trip) => (
            <TouchableOpacity 
              key={trip.id} 
              style={styles.tripCard}
              onPress={() => Alert.alert('Trip Details', `Viewing details for trip ${trip.id}`)}
            >
              <View style={styles.tripHeader}>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripPassenger}>{trip.passenger}</Text>
                  <Text style={styles.tripRoute}>{trip.route}</Text>
                  <Text style={styles.tripTime}>{trip.time}</Text>
                </View>
                <View style={styles.tripFare}>
                  <Text style={styles.fareAmount}>R{trip.fare}</Text>
                  <View style={styles.statusBadge}>
                    <CheckCircle size={12} color={Colors.success} />
                    <Text style={styles.statusBadgeText}>{trip.status}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Create Trip Modal */}
      <Modal
        visible={showCreateTripModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateTripModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Trip</Text>
              <TouchableOpacity 
                onPress={() => setShowCreateTripModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBodyContent}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>From *</Text>
                <View style={styles.inputContainer}>
                  <MapPin size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Pickup location"
                    placeholderTextColor={Colors.textSecondary}
                    value={tripForm.from}
                    onChangeText={(value) => setTripForm({...tripForm, from: value})}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>To *</Text>
                <View style={styles.inputContainer}>
                  <MapPin size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Destination"
                    placeholderTextColor={Colors.textSecondary}
                    value={tripForm.to}
                    onChangeText={(value) => setTripForm({...tripForm, to: value})}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date *</Text>
                  <View style={styles.inputContainer}>
                    <Calendar size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="YYYY-MM-DD (e.g., 2024-12-25)"
                      placeholderTextColor={Colors.textSecondary}
                      value={tripForm.date}
                      onChangeText={(value) => setTripForm({...tripForm, date: value})}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                  </View>
                  <TouchableOpacity 
                    style={styles.helperButton}
                    onPress={() => {
                      const today = getCurrentDate();
                      setTripForm({...tripForm, date: today});
                    }}
                  >
                    <Text style={styles.helperButtonText}>Set to today</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ width: 24 }} />
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Time *</Text>
                  <View style={styles.inputContainer}>
                    <Clock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="HH:MM (e.g., 14:30)"
                      placeholderTextColor={Colors.textSecondary}
                      value={tripForm.time}
                      onChangeText={(value) => setTripForm({...tripForm, time: value})}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                  </View>
                  <TouchableOpacity 
                    style={styles.helperButton}
                    onPress={() => {
                      const now = getCurrentTime();
                      setTripForm({...tripForm, time: now});
                    }}
                  >
                    <Text style={styles.helperButtonText}>Set to now</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Price (R) *</Text>
                  <View style={styles.inputContainer}>
                    <DollarSign size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="0.00"
                      placeholderTextColor={Colors.textSecondary}
                      value={tripForm.price}
                      onChangeText={(value) => {
                        // Only allow numbers and decimal point
                        const cleaned = value.replace(/[^0-9.]/g, '');
                        // Ensure only one decimal point
                        const parts = cleaned.split('.');
                        if (parts.length > 2) return;
                        // Limit to 2 decimal places
                        if (parts[1] && parts[1].length > 2) return;
                        setTripForm({...tripForm, price: cleaned});
                      }}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                    />
                  </View>
                  <View style={styles.helperButtonsRow}>
                    <TouchableOpacity 
                      style={styles.helperButton}
                      onPress={() => setTripForm({...tripForm, price: '50'})}
                    >
                      <Text style={styles.helperButtonText}>R50</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.helperButton}
                      onPress={() => setTripForm({...tripForm, price: '100'})}
                    >
                      <Text style={styles.helperButtonText}>R100</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.helperButton}
                      onPress={() => setTripForm({...tripForm, price: '150'})}
                    >
                      <Text style={styles.helperButtonText}>R150</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Seats *</Text>
                  <View style={styles.inputContainer}>
                    <Car size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="4"
                      placeholderTextColor={Colors.textSecondary}
                      value={tripForm.seats}
                      onChangeText={(value) => {
                        // Only allow numbers
                        const cleaned = value.replace(/[^0-9]/g, '');
                        // Limit to 1-10 seats
                        const num = parseInt(cleaned);
                        if (num > 10) return;
                        setTripForm({...tripForm, seats: cleaned});
                      }}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                  </View>
                  <View style={styles.helperButtonsRow}>
                    <TouchableOpacity 
                      style={styles.helperButton}
                      onPress={() => setTripForm({...tripForm, seats: '1'})}
                    >
                      <Text style={styles.helperButtonText}>1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.helperButton}
                      onPress={() => setTripForm({...tripForm, seats: '2'})}
                    >
                      <Text style={styles.helperButtonText}>2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.helperButton}
                      onPress={() => setTripForm({...tripForm, seats: '4'})}
                    >
                      <Text style={styles.helperButtonText}>4</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.helperButton}
                      onPress={() => setTripForm({...tripForm, seats: '6'})}
                    >
                      <Text style={styles.helperButtonText}>6</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Additional details about the trip..."
                    placeholderTextColor={Colors.textSecondary}
                    value={tripForm.description}
                    onChangeText={(value) => setTripForm({...tripForm, description: value})}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Form validation summary */}
              {(!tripForm.from || !tripForm.to || !tripForm.date || !tripForm.time || !tripForm.price || !tripForm.seats) && (
                <View style={styles.validationContainer}>
                  <Text style={styles.validationTitle}>Please fill in all required fields:</Text>
                  {!tripForm.from && <Text style={styles.validationText}>• Pickup location</Text>}
                  {!tripForm.to && <Text style={styles.validationText}>• Destination</Text>}
                  {!tripForm.date && <Text style={styles.validationText}>• Date</Text>}
                  {!tripForm.time && <Text style={styles.validationText}>• Time</Text>}
                  {!tripForm.price && <Text style={styles.validationText}>• Price</Text>}
                  {!tripForm.seats && <Text style={styles.validationText}>• Number of seats</Text>}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateTripModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  (!tripForm.from || !tripForm.to || !tripForm.date || !tripForm.time || !tripForm.price || !tripForm.seats) && styles.createButtonDisabled
                ]}
                onPress={handleCreateTrip}
                disabled={!tripForm.from || !tripForm.to || !tripForm.date || !tripForm.time || !tripForm.price || !tripForm.seats}
              >
                <LinearGradient
                  colors={(!tripForm.from || !tripForm.to || !tripForm.date || !tripForm.time || !tripForm.price || !tripForm.seats) 
                    ? [Colors.textSecondary, Colors.textSecondary] 
                    : [Colors.primary, Colors.secondary]
                  }
                  style={styles.createButtonGradient}
                >
                  <Text style={styles.createButtonText}>Create Trip</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  driverName: {
    fontSize: FontSizes['2xl'],
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusGradient: {
    padding: 20,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
  },
  statusSubtext: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.background,
    opacity: 0.9,
  },
  statusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusButtonOnline: {
    backgroundColor: Colors.background,
  },
  createTripButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createTripGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  createTripText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: FontSizes['2xl'],
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statTrendText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.success,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    textAlign: 'center',
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
  },
  tripInfo: {
    flex: 1,
  },
  tripPassenger: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  tripRoute: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  tripTime: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  tripFare: {
    alignItems: 'flex-end',
  },
  fareAmount: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.success,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.success,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalBodyContent: {
    padding: 20,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  createButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  validationContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: 12,
    marginBottom: 16,
  },
  validationTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.bold,
    color: Colors.warning,
    marginBottom: 8,
  },
  validationText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.regular,
    color: Colors.warning,
    marginBottom: 4,
  },
  helperButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    marginTop: 8,
  },
  helperButtonText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  helperButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerButtonText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    marginLeft: 8,
  },
}); 