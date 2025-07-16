import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Share2, Copy, Gift, Users, DollarSign, TrendingUp, Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

export default function ReferralProgramScreen() {
  const router = useRouter();
  const [referralCode] = useState('MZANSI2025');
  const [referralStats] = useState({
    totalReferrals: 8,
    successfulReferrals: 6,
    totalEarnings: 300,
    pendingEarnings: 100,
  });

  const [referralHistory] = useState([
    {
      id: '1',
      name: 'John Doe',
      date: '2025-01-10',
      status: 'completed',
      earnings: 50,
    },
    {
      id: '2',
      name: 'Sarah Smith',
      date: '2025-01-08',
      status: 'pending',
      earnings: 50,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      date: '2025-01-05',
      status: 'completed',
      earnings: 50,
    },
    {
      id: '4',
      name: 'Lisa Brown',
      date: '2025-01-03',
      status: 'completed',
      earnings: 50,
    },
  ]);

  const handleShareReferral = async () => {
    try {
      const message = `Join MzansiMove and get R50 off your first ride! Use my referral code: ${referralCode}\n\nDownload the app: https://mzansimove.com`;
      await Share.share({
        message,
        title: 'Join MzansiMove',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral code');
    }
  };

  const handleCopyCode = () => {
    // In a real app, you would use Clipboard API
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleWithdrawEarnings = () => {
    Alert.alert(
      'Withdraw Earnings',
      `Withdraw R${referralStats.totalEarnings} to your payment method?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          onPress: () => Alert.alert('Success', 'Earnings have been transferred to your account.'),
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? Colors.success : Colors.warning;
  };

  const getStatusText = (status: string) => {
    return status === 'completed' ? 'Completed' : 'Pending';
  };

  const renderReferralItem = (referral: any) => (
    <View key={referral.id} style={styles.referralItem}>
      <View style={styles.referralInfo}>
        <View style={styles.referralAvatar}>
          <Users size={20} color={Colors.primary} />
        </View>
        <View style={styles.referralDetails}>
          <Text style={styles.referralName}>{referral.name}</Text>
          <Text style={styles.referralDate}>{referral.date}</Text>
        </View>
      </View>
      <View style={styles.referralMeta}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(referral.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(referral.status) }]}>
            {getStatusText(referral.status)}
          </Text>
        </View>
        <Text style={styles.earningsText}>R{referral.earnings}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Referral Program</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Overview */}
          <View style={styles.statsCard}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.statsGradient}
            >
              <View style={styles.statsHeader}>
                <Gift size={32} color={Colors.background} />
                <Text style={styles.statsTitle}>Earn R50 per referral!</Text>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{referralStats.totalReferrals}</Text>
                  <Text style={styles.statLabel}>Total Referrals</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{referralStats.successfulReferrals}</Text>
                  <Text style={styles.statLabel}>Successful</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>R{referralStats.totalEarnings}</Text>
                  <Text style={styles.statLabel}>Total Earned</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Referral Code */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Referral Code</Text>
            <View style={styles.referralCodeCard}>
              <View style={styles.codeContainer}>
                <Text style={styles.referralCode}>{referralCode}</Text>
                <Text style={styles.codeDescription}>
                  Share this code with friends and earn R50 for each successful referral
                </Text>
              </View>
              <View style={styles.codeActions}>
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                  <Copy size={20} color={Colors.primary} />
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton} onPress={handleShareReferral}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    style={styles.shareButtonGradient}
                  >
                    <Share2 size={20} color={Colors.background} />
                    <Text style={styles.shareButtonText}>Share</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Earnings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Earnings</Text>
            <View style={styles.earningsCard}>
              <View style={styles.earningsRow}>
                <View style={styles.earningsItem}>
                  <DollarSign size={24} color={Colors.success} />
                  <View style={styles.earningsInfo}>
                    <Text style={styles.earningsLabel}>Available</Text>
                    <Text style={styles.earningsAmount}>R{referralStats.totalEarnings}</Text>
                  </View>
                </View>
                <View style={styles.earningsItem}>
                  <TrendingUp size={24} color={Colors.warning} />
                  <View style={styles.earningsInfo}>
                    <Text style={styles.earningsLabel}>Pending</Text>
                    <Text style={styles.earningsAmount}>R{referralStats.pendingEarnings}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdrawEarnings}>
                <LinearGradient
                  colors={[Colors.success, Colors.success + '80']}
                  style={styles.withdrawButtonGradient}
                >
                  <Text style={styles.withdrawButtonText}>Withdraw Earnings</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Referral History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Referral History</Text>
            <View style={styles.referralHistory}>
              {referralHistory.map(renderReferralItem)}
            </View>
          </View>

          {/* How It Works */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.howItWorks}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Share Your Code</Text>
                  <Text style={styles.stepDescription}>
                    Share your unique referral code with friends and family
                  </Text>
                </View>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>They Sign Up</Text>
                  <Text style={styles.stepDescription}>
                    Your friends use your code when they create their account
                  </Text>
                </View>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>You Both Earn</Text>
                  <Text style={styles.stepDescription}>
                    You get R50 when they complete their first ride
                  </Text>
                </View>
              </View>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  referralCodeCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeContainer: {
    marginBottom: 20,
  },
  referralCode: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  codeDescription: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  copyButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.primary,
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  shareButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
    marginLeft: 8,
  },
  earningsCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  earningsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  earningsInfo: {
    marginLeft: 12,
  },
  earningsLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  withdrawButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  withdrawButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
  },
  referralHistory: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  referralInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  referralDetails: {
    flex: 1,
  },
  referralName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  referralDate: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  referralMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
  },
  earningsText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  howItWorks: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
}); 