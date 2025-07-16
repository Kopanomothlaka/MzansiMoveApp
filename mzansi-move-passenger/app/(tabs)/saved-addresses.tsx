import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, MapPin, Home, Building, Edit, Trash2, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

export default function SavedAddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      name: 'Home',
      address: '123 Main Street, Johannesburg, 2000',
      type: 'home',
      isDefault: true,
      icon: Home,
    },
    {
      id: '2',
      name: 'Work',
      address: '456 Business District, Sandton, 2196',
      type: 'work',
      isDefault: false,
      icon: Building,
    },
    {
      id: '3',
      name: 'Gym',
      address: '789 Fitness Center, Rosebank, 2196',
      type: 'other',
      isDefault: false,
      icon: MapPin,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    type: 'other',
  });

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const addressObj = {
      id: Date.now().toString(),
      name: newAddress.name,
      address: newAddress.address,
      type: newAddress.type,
      isDefault: false,
      icon: newAddress.type === 'home' ? Home : newAddress.type === 'work' ? Building : MapPin,
    };

    setAddresses(prev => [...prev, addressObj]);
    setNewAddress({ name: '', address: '', type: 'other' });
    setShowAddModal(false);
    Alert.alert('Success', 'Address added successfully!');
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => 
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
    );
    Alert.alert('Default Address', 'This address has been set as your default.');
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses(prev => prev.filter(addr => addr.id !== id));
            Alert.alert('Deleted', 'Address has been removed.');
          },
        },
      ]
    );
  };

  const renderAddressCard = (address: any) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressInfo}>
          <View style={styles.addressIcon}>
            <address.icon size={20} color={Colors.primary} />
          </View>
          <View style={styles.addressDetails}>
            <Text style={styles.addressName}>{address.name}</Text>
            <Text style={styles.addressText}>{address.address}</Text>
          </View>
        </View>
        <View style={styles.addressActions}>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Star size={12} color={Colors.background} fill={Colors.background} />
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.addressFooter}>
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.defaultButton}
            onPress={() => handleSetDefault(address.id)}
          >
            <Text style={styles.defaultButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => Alert.alert('Edit', 'Edit functionality would be implemented here')}
        >
          <Edit size={16} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAddress(address.id)}
        >
          <Trash2 size={16} color={Colors.error} />
        </TouchableOpacity>
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
          <Text style={styles.title}>Saved Addresses</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Plus size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Address List */}
          <View style={styles.addressesList}>
            {addresses.map(renderAddressCard)}
          </View>

          {/* Add New Address Button */}
          <TouchableOpacity style={styles.addAddressButton} onPress={() => setShowAddModal(true)}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.addAddressGradient}
            >
              <Plus size={24} color={Colors.background} />
              <Text style={styles.addAddressText}>Add New Address</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      {/* Add Address Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Home, Work, Gym"
                  value={newAddress.name}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, name: text }))}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Address</Text>
                <TextInput
                  style={[styles.textInput, styles.addressInput]}
                  placeholder="Enter complete address"
                  value={newAddress.address}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, address: text }))}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleAddAddress}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Add Address</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  addressesList: {
    gap: 16,
    marginBottom: 32,
  },
  addressCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressDetails: {
    flex: 1,
  },
  addressName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  addressText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  addressActions: {
    alignItems: 'flex-end',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.background,
    marginLeft: 4,
  },
  addressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  addAddressButton: {
    marginBottom: 32,
  },
  addAddressGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addAddressText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
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
    fontSize: FontSizes.lg,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  closeButton: {
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
    padding: 16,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
  },
}); 