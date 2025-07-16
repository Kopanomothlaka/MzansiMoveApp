import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, CreditCard, Trash2, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

const { width, height } = Dimensions.get('window');

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiry: '12/24',
      isDefault: true,
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '8888',
      expiry: '06/25',
      isDefault: false,
    },
  ]);

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const handleAddCard = () => {
    setShowAddCardModal(true);
  };

  const handleSaveCard = () => {
    // Validate the form
    if (!newCard.cardNumber || !newCard.expiryDate || !newCard.cvv || !newCard.cardholderName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newCard.cardNumber.length < 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }

    if (newCard.cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return;
    }

    // Extract last 4 digits
    const last4 = newCard.cardNumber.slice(-4);
    
    // Determine card type based on first digit
    const cardType = newCard.cardNumber.startsWith('4') ? 'visa' : 'mastercard';

    // Create new card object
    const newCardObj = {
      id: Date.now().toString(),
      type: cardType,
      last4: last4,
      expiry: newCard.expiryDate,
      isDefault: false,
    };

    // Add to payment methods
    setPaymentMethods(prev => [...prev, newCardObj]);

    // Reset form
    setNewCard({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    });

    // Close modal
    setShowAddCardModal(false);

    Alert.alert('Success', 'Card added successfully!');
  };

  const handleRemoveCard = (id: string) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this card?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(card => card.id !== id));
            Alert.alert('Card Removed', 'The card has been removed successfully.');
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(card => ({
        ...card,
        isDefault: card.id === id
      }))
    );
    Alert.alert('Default Card', 'This card has been set as your default payment method.');
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Payment Methods</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
            <Plus size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Payment Methods List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Cards</Text>
            <View style={styles.cardsList}>
              {paymentMethods.map((method) => (
                <View key={method.id} style={styles.cardItem}>
                  <View style={styles.cardInfo}>
                    <CreditCard size={24} color={Colors.primary} />
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardNumber}>
                        •••• •••• •••• {method.last4}
                      </Text>
                      <Text style={styles.cardExpiry}>Expires {method.expiry}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        style={styles.defaultButton}
                        onPress={() => handleSetDefault(method.id)}
                      >
                        <Text style={styles.defaultButtonText}>Set Default</Text>
                      </TouchableOpacity>
                    )}
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleRemoveCard(method.id)}
                    >
                      <Trash2 size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Add New Card Button */}
          <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.addCardGradient}
            >
              <Plus size={24} color={Colors.background} />
              <Text style={styles.addCardText}>Add New Card</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Text style={styles.securityTitle}>Secure Payments</Text>
            <Text style={styles.securityText}>
              Your payment information is encrypted and securely stored. We never store your full card details on our servers.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.modalGradient}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)} style={styles.closeButton}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView 
              style={styles.modalContent} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContentContainer}
            >
              {/* Card Preview */}
              <View style={styles.cardPreview}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.cardPreviewGradient}
                >
                  <View style={styles.cardPreviewHeader}>
                    <CreditCard size={width > 400 ? 32 : 28} color={Colors.background} />
                    <Text style={styles.cardPreviewType}>
                      {newCard.cardNumber.startsWith('4') ? 'VISA' : 'MASTERCARD'}
                    </Text>
                  </View>
                  <Text style={styles.cardPreviewNumber}>
                    {newCard.cardNumber || '•••• •••• •••• ••••'}
                  </Text>
                  <View style={styles.cardPreviewFooter}>
                    <View style={styles.cardPreviewFooterItem}>
                      <Text style={styles.cardPreviewLabel}>CARDHOLDER</Text>
                      <Text style={styles.cardPreviewValue} numberOfLines={1}>
                        {newCard.cardholderName || 'YOUR NAME'}
                      </Text>
                    </View>
                    <View style={styles.cardPreviewFooterItem}>
                      <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                      <Text style={styles.cardPreviewValue}>
                        {newCard.expiryDate || 'MM/YY'}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Form Fields */}
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Card Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={Colors.textSecondary}
                    value={newCard.cardNumber}
                    onChangeText={(text) => setNewCard(prev => ({ ...prev, cardNumber: formatCardNumber(text) }))}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="John Doe"
                    placeholderTextColor={Colors.textSecondary}
                    value={newCard.cardholderName}
                    onChangeText={(text) => setNewCard(prev => ({ ...prev, cardholderName: text }))}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Expiry Date</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="MM/YY"
                      placeholderTextColor={Colors.textSecondary}
                      value={newCard.expiryDate}
                      onChangeText={(text) => setNewCard(prev => ({ ...prev, expiryDate: formatExpiryDate(text) }))}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="123"
                      placeholderTextColor={Colors.textSecondary}
                      value={newCard.cvv}
                      onChangeText={(text) => setNewCard(prev => ({ ...prev, cvv: text.replace(/\D/g, '') }))}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.saveCardButton} onPress={handleSaveCard}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.saveCardGradient}
                >
                  <Text style={styles.saveCardText}>Add Card</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: Math.max(24, width * 0.06),
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: Math.max(24, width * 0.06),
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
  cardsList: {
    gap: 16,
  },
  cardItem: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardDetails: {
    marginLeft: 12,
    flex: 1,
  },
  cardNumber: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  defaultButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.primary,
  },
  defaultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.success + '20',
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.success,
  },
  deleteButton: {
    padding: 8,
  },
  addCardButton: {
    marginBottom: 32,
  },
  addCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addCardText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
  },
  securityNote: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  securityTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  securityText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Math.max(24, width * 0.06),
    paddingTop: 20,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: Math.max(24, width * 0.06),
    paddingBottom: 20,
  },
  cardPreview: {
    marginBottom: Math.max(32, height * 0.04),
  },
  cardPreviewGradient: {
    borderRadius: 16,
    padding: Math.max(24, width * 0.06),
    aspectRatio: 1.6,
    justifyContent: 'space-between',
    minHeight: 200,
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPreviewType: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
  },
  cardPreviewNumber: {
    fontSize: Math.max(FontSizes.xl, width * 0.05),
    fontFamily: Fonts.heading.bold,
    color: Colors.background,
    letterSpacing: 2,
    textAlign: 'center',
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardPreviewFooterItem: {
    flex: 1,
  },
  cardPreviewLabel: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  cardPreviewValue: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
  },
  formSection: {
    marginBottom: Math.max(32, height * 0.04),
  },
  inputGroup: {
    marginBottom: Math.max(24, height * 0.03),
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Math.max(16, height * 0.02),
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: Math.max(50, height * 0.06),
  },
  row: {
    flexDirection: 'row',
  },
  modalFooter: {
    paddingHorizontal: Math.max(24, width * 0.06),
    paddingBottom: Math.max(32, height * 0.04),
    paddingTop: 16,
  },
  saveCardButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveCardGradient: {
    padding: Math.max(16, height * 0.02),
    alignItems: 'center',
  },
  saveCardText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
  },
}); 