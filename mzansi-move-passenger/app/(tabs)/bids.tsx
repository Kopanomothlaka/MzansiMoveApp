import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Package, ArrowRight, Tag, X, TrendingUp, TrendingDown, Hourglass, CheckCircle, XCircle } from 'lucide-react-native';
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
        return <Hourglass size={12} color={Colors.warning} style={{ marginRight: 4 }} />;
      case 'confirmed':
      case 'accepted':
        return <CheckCircle size={12} color={Colors.success} style={{ marginRight: 4 }} />;
      case 'rejected':
      case 'outbid':
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
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>My Bid</Text>
            <Text style={styles.detailValue}>R{bid.bid_amount || bid.amount || bid.bidAmount || 0}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{trip ? 'Trip Price' : 'Message'}</Text>
            <Text style={styles.detailValue}>{trip ? `R${trip.price}` : (bid.message || 'No message')}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.withdrawButton} onPress={() => handleWithdrawBid(bid)} disabled={actionLoading}>
            <X size={16} color={Colors.error} />
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.increaseButton} onPress={() => handleIncreaseBid(bid)} disabled={actionLoading}>
            <TrendingUp size={16} color={'#fff'} />
            <Text style={styles.increaseButtonText}>Increase Bid</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        <Text style={styles.title}>My Bids</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : bids.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have no bids yet.</Text>
            <Text style={[styles.emptyText, { marginTop: 10, fontSize: FontSizes.sm }]}>
              Debug: Check console for bid data
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {bids.map(renderBid)}
          </ScrollView>
        )}
        {/* Increase Bid Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <View style={{ backgroundColor: Colors.background, borderRadius: 20, padding: 28, width: '85%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 }}>
              <Text style={{ fontSize: FontSizes.lg, fontFamily: Fonts.heading.bold, marginBottom: 18, color: Colors.primary }}>Increase Your Bid</Text>
              <Text style={{ marginBottom: 10, color: Colors.textSecondary }}>Enter your new bid amount:</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 14, marginBottom: 18, fontSize: FontSizes.base, backgroundColor: Colors.surface }}
                placeholder="Enter amount (e.g. 150)"
                keyboardType="numeric"
                value={newAmount}
                onChangeText={setNewAmount}
                editable={!actionLoading}
                placeholderTextColor={Colors.textSecondary}
              />
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: Colors.surface, padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }}
                  onPress={() => setModalVisible(false)}
                  disabled={actionLoading}
                >
                  <Text style={{ color: Colors.text, fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: Colors.primary, padding: 14, borderRadius: 10, alignItems: 'center', shadowColor: Colors.primary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
                  onPress={submitIncreaseBid}
                  disabled={actionLoading}
                >
                  {actionLoading ? <ActivityIndicator color={Colors.background} /> : <Text style={{ color: Colors.background, fontWeight: 'bold' }}>Submit</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  gradient: { flex: 1, paddingHorizontal: 20, paddingTop: 32 },
  title: { fontSize: FontSizes.xl, fontFamily: Fonts.heading.bold, color: Colors.text, marginBottom: 24, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: FontSizes.base, color: Colors.textSecondary },
  scrollContent: { paddingBottom: 40, paddingHorizontal: 18 },
  bidCard: {
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  routeText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.bold,
    textTransform: 'capitalize',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '20',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  withdrawButtonText: {
    color: Colors.error,
    fontWeight: 'bold',
  },
  increaseButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  increaseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});