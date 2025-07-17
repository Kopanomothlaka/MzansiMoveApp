import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Package, ArrowRight, Tag, X, TrendingUp, TrendingDown, Hourglass, CheckCircle, XCircle, DollarSign, MapPin, Clock, Zap, Target, Award } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';
import { supabase } from '@/constants/supabase';

export default function BidsScreen() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [newAmount, setNewAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
      const { data, error } = await supabase
        .from('bids')
        .select('*, trips!left(*)')
        .eq('rider_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching bids:', error);
        setBids([]);
      } else {
        console.log('Fetched bids:', data);
        if (data && data.length > 0) {
          console.log('First bid structure:', data[0]);
        }
        setBids(data || []);
      }
    } catch (e) {
      console.error('Exception fetching bids:', e);
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIncreaseBid = (bid: any) => {
    console.log('Bid data:', bid);
    setSelectedBid(bid);
    // Handle different possible field names for bid amount
    const bidAmount = bid.bid_amount || bid.amount || bid.bidAmount || 0;
    setNewAmount(bidAmount.toString());
    setModalVisible(true);
  };

  const submitIncreaseBid = async () => {
    if (!newAmount || isNaN(Number(newAmount)) || Number(newAmount) <= 0) {
      Alert.alert('Invalid Bid', 'Please enter a valid bid amount.');
      return;
    }
    setActionLoading(true);
    try {
      // Determine the correct field name to update
      const updateField = selectedBid.bid_amount !== undefined ? 'bid_amount' : 
                         selectedBid.amount !== undefined ? 'amount' : 
                         selectedBid.bidAmount !== undefined ? 'bidAmount' : 'bid_amount';
      
      const { error } = await supabase
        .from('bids')
        .update({ [updateField]: Number(newAmount) })
        .eq('id', selectedBid.id);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setModalVisible(false);
        setSelectedBid(null);
        setNewAmount('');
        fetchBids();
        Alert.alert('Success', 'Your bid has been updated!');
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawBid = async (bid: any) => {
    Alert.alert('Withdraw Bid', 'Are you sure you want to withdraw your bid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw', style: 'destructive', onPress: async () => {
          setActionLoading(true);
          try {
            const { error } = await supabase
              .from('bids')
              .delete()
              .eq('id', bid.id);
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              fetchBids();
              Alert.alert('Success', 'Your bid has been withdrawn.');
            }
          } catch (e) {
            Alert.alert('Error', 'An unexpected error occurred.');
          } finally {
            setActionLoading(false);
          }
        }
      }
    ]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Hourglass size={14} color={Colors.warning} style={{ marginRight: 6 }} />;
      case 'confirmed':
      case 'accepted':
        return <CheckCircle size={14} color={Colors.success} style={{ marginRight: 6 }} />;
      case 'rejected':
      case 'outbid':
        return <XCircle size={14} color={Colors.error} style={{ marginRight: 6 }} />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: Colors.warning, backgroundColor: Colors.warning + '20' };
      case 'confirmed':
      case 'accepted':
        return { color: Colors.success, backgroundColor: Colors.success + '20' };
      case 'rejected':
      case 'outbid':
        return { color: Colors.error, backgroundColor: Colors.error + '20' };
      default:
        return { color: Colors.textSecondary, backgroundColor: Colors.border };
    }
  };

  const renderBid = (bid: any) => {
    const trip = bid.trips;
    return (
      <View key={bid.id} style={styles.bidCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.routeText}>
            {trip ? (
              <>
                {trip.from_location} <ArrowRight size={14} color={Colors.textSecondary} /> {trip.to_location}
              </>
            ) : (
              `Trip #${bid.trip_id?.slice(0, 8)}`
            )}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(bid.status).backgroundColor }]}>
            {getStatusIcon(bid.status)}
            <Text style={[styles.statusText, { color: getStatusStyle(bid.status).color }]}>{bid.status}</Text>
        <LinearGradient
          colors={['rgba(37,99,235,0.08)', 'rgba(59,130,246,0.04)']}
          style={styles.bidCardGradient}
        >
          {/* Header with Route and Status */}
          <View style={styles.cardHeader}>
            <View style={styles.routeContainer}>
              <View style={styles.routeIconContainer}>
                <MapPin size={16} color={Colors.primary} />
              </View>
              <Text style={styles.routeText} numberOfLines={1}>
                {trip.from_location} 
              </Text>
              <ArrowRight size={14} color={Colors.textSecondary} style={styles.arrowIcon} />
              <Text style={styles.routeText} numberOfLines={1}>
                {trip.to_location}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(bid.status).backgroundColor }]}>
              {getStatusIcon(bid.status)}
              <Text style={[styles.statusText, { color: getStatusStyle(bid.status).color }]}>
                {bid.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>My Bid</Text>
            <Text style={styles.detailValue}>R{bid.bid_amount || bid.amount || bid.bidAmount || 0}</Text>

          {/* Trip Details */}
          <View style={styles.tripDetails}>
            <View style={styles.detailItem}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{trip.trip_date} • {trip.trip_time}</Text>
            </View>
            <View style={styles.detailItem}>
              <Car size={14} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{trip.vehicle_make || 'Vehicle'} {trip.vehicle_model || ''}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{trip ? 'Trip Price' : 'Message'}</Text>
            <Text style={styles.detailValue}>{trip ? `R${trip.price}` : (bid.message || 'No message')}</Text>
          </View>
        </View>

          {/* Bid Information */}
          <View style={styles.bidInfo}>
            <View style={styles.bidAmountContainer}>
              <View style={styles.bidAmountRow}>
                <View style={styles.bidItem}>
                  <DollarSign size={16} color={Colors.primary} />
                  <Text style={styles.bidLabel}>My Bid</Text>
                  <Text style={styles.bidAmount}>R{bid.amount}</Text>
                </View>
                <View style={styles.bidItem}>
                  <Target size={16} color={Colors.textSecondary} />
                  <Text style={styles.bidLabel}>Trip Price</Text>
                  <Text style={styles.tripPrice}>R{trip.price}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.withdrawButton} 
              onPress={() => handleWithdrawBid(bid)} 
              disabled={actionLoading}
            >
              <LinearGradient
                colors={[Colors.error + '20', Colors.error + '10']}
                style={styles.withdrawButtonGradient}
              >
                <X size={16} color={Colors.error} />
                <Text style={styles.withdrawButtonText}>Withdraw</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.increaseButton} 
              onPress={() => handleIncreaseBid(bid)} 
              disabled={actionLoading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.increaseButtonGradient}
              >
                <TrendingUp size={16} color={Colors.background} />
                <Text style={styles.increaseButtonText}>Increase Bid</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.headerIconGradient}
              >
                <Tag size={24} color={Colors.background} />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>My Bids</Text>
              <Text style={styles.subtitle}>Track your active bids</Text>
            </View>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Zap size={16} color={Colors.warning} />
              <Text style={styles.statText}>{bids.filter(b => b.status === 'pending').length}</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading your bids...</Text>
            </View>
          </View>
        ) : bids.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have no bids yet.</Text>
            <Text style={[styles.emptyText, { marginTop: 10, fontSize: FontSizes.sm }]}>
              Debug: Check console for bid data
            </Text>
            <View style={styles.emptyContent}>
              <View style={styles.emptyIcon}>
                <LinearGradient
                  colors={[Colors.textSecondary + '20', Colors.textSecondary + '10']}
                  style={styles.emptyIconGradient}
                >
                  <Tag size={48} color={Colors.textSecondary} />
                </LinearGradient>
              </View>
              <Text style={styles.emptyTitle}>No Bids Yet</Text>
              <Text style={styles.emptyText}>Start bidding on trips to see them here</Text>
            </View>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            {bids.map(renderBid)}
          </ScrollView>
        )}

        {/* Enhanced Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={[Colors.background, Colors.surface]}
                style={styles.modalGradient}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <View style={styles.modalIcon}>
                      <TrendingUp size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.modalTitle}>Increase Your Bid</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <X size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Modal Content */}
                <View style={styles.modalBody}>
                  <Text style={styles.modalDescription}>
                    Enter your new bid amount to increase your chances of getting this trip
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>New Bid Amount</Text>
                    <View style={styles.inputWrapper}>
                      <DollarSign size={20} color={Colors.primary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter amount (e.g. 150)"
                        keyboardType="numeric"
                        value={newAmount}
                        onChangeText={setNewAmount}
                        editable={!actionLoading}
                        placeholderTextColor={Colors.textSecondary}
                      />
                    </View>
                  </View>
                </View>

                {/* Modal Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setModalVisible(false)}
                    disabled={actionLoading}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalSubmitButton}
                    onPress={submitIncreaseBid}
                    disabled={actionLoading}
                  >
                    <LinearGradient
                      colors={[Colors.primary, Colors.secondary]}
                      style={styles.modalSubmitGradient}
                    >
                      {actionLoading ? (
                        <ActivityIndicator color={Colors.background} size="small" />
                      ) : (
                        <>
                          <Award size={16} color={Colors.background} />
                          <Text style={styles.modalSubmitText}>Submit Bid</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  title: { 
    fontSize: FontSizes.xl, 
    fontFamily: Fonts.heading.bold, 
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  headerStats: {
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.bold,
    color: Colors.warning,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyContent: {
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
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  emptyText: { 
    fontSize: FontSizes.base, 
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollContent: { 
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  bidCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bidCardGradient: {
    padding: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  routeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  routeText: { 
    fontSize: FontSizes.base, 
    fontFamily: Fonts.heading.medium, 
    color: Colors.text,
    flex: 1,
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.bold,
    textTransform: 'capitalize',
  },
  tripDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  bidInfo: {
    marginBottom: 20,
  },
  bidAmountContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  bidAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bidItem: {
    alignItems: 'center',
    gap: 4,
  },
  bidLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  bidAmount: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
  },
  tripPrice: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  withdrawButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  withdrawButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  withdrawButtonText: {
    color: Colors.error,
    fontFamily: Fonts.body.bold,
    fontSize: FontSizes.sm,
  },
  increaseButton: {
    flex: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  increaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  increaseButtonText: {
    color: Colors.background,
    fontFamily: Fonts.body.bold,
    fontSize: FontSizes.sm,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
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
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 24,
  },
  modalDescription: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  modalSubmitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSubmitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  modalSubmitText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
  },
});