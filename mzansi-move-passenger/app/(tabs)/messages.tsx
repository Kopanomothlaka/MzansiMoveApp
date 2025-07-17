import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MessageCircle, Phone, Video, MoreVertical, Send, DollarSign, Plus, Paperclip, Star, Clock, MapPin, Zap, Users } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

const { width } = Dimensions.get('window');

export default function MessagesScreen() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');

  const conversations = [
    {
      id: '1',
      name: 'Sipho M.',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'I am at the pickup point, see you soon!',
      time: '2m ago',
      unread: 2,
      type: 'provider',
      tripRoute: 'Johannesburg → Pretoria',
      currentOffer: 120,
      status: 'active',
      rating: 4.8,
      isOnline: true
    },
    {
      id: '2',
      name: 'Thandi N.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'Your package is loaded and ready for delivery.',
      time: '1h ago',
      unread: 0,
      type: 'provider',
      tripRoute: 'Cape Town → Stellenbosch',
      status: 'confirmed',
      rating: 4.9,
      isOnline: false
    },
    {
      id: '3',
      name: 'Lebo K.',
      avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'I will arrive in 10 minutes.',
      time: '3h ago',
      unread: 1,
      type: 'provider',
      tripRoute: 'Durban → Pietermaritzburg',
      status: 'pending',
      rating: 4.7,
      isOnline: true
    },
  ];

  const chatThreads: Record<string, any[]> = {
    '1': [
      { id: '1', sender: 'provider', text: 'Hi, I am on my way to the pickup point.', time: '10:30 AM', type: 'text' },
      { id: '2', sender: 'rider', text: 'Great! I am waiting at the main entrance.', time: '10:31 AM', type: 'text' },
      { id: '3', sender: 'provider', text: 'See you soon!', time: '10:32 AM', type: 'text' },
      { id: '4', sender: 'provider', text: '', time: '10:33 AM', type: 'offer', offerAmount: 120, originalPrice: 130 },
      { id: '5', sender: 'rider', text: 'Thanks for the offer, I accept!', time: '10:34 AM', type: 'text' },
    ],
    '2': [
      { id: '1', sender: 'provider', text: 'Your package is loaded and ready for delivery.', time: '9:00 AM', type: 'text' },
      { id: '2', sender: 'rider', text: 'Thank you! Please let me know when you arrive.', time: '9:01 AM', type: 'text' },
      { id: '3', sender: 'provider', text: 'Will do!', time: '9:02 AM', type: 'text' },
    ],
    '3': [
      { id: '1', sender: 'provider', text: 'I will arrive in 10 minutes.', time: '8:00 AM', type: 'text' },
      { id: '2', sender: 'rider', text: 'Perfect, I am ready.', time: '8:01 AM', type: 'text' },
      { id: '3', sender: 'provider', text: 'Looking forward to meeting you.', time: '8:02 AM', type: 'text' },
    ],
  };

  const quickResponsesMap: Record<string, string[]> = {
    '1': ['I am at the pickup point', 'Can you wait a bit?', 'Thank you!'],
    '2': ['Thanks for the update', 'Let me know when you arrive', 'Safe travels!'],
    '3': ['I am ready', 'See you soon', 'Thank you!'],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.warning;
      case 'confirmed': return Colors.success;
      case 'pending': return Colors.info;
      default: return Colors.textSecondary;
    }
  };

  const renderConversationItem = (conversation: any) => (
    <TouchableOpacity
      key={conversation.id}
      style={[
        styles.conversationItem,
        selectedChat === conversation.id && styles.selectedConversation
      ]}
      onPress={() => setSelectedChat(conversation.id)}
    >
      <LinearGradient
        colors={selectedChat === conversation.id ? 
          ['rgba(37,99,235,0.1)', 'rgba(59,130,246,0.05)'] : 
          ['transparent', 'transparent']
        }
        style={styles.conversationGradient}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: conversation.isOnline ? Colors.success : Colors.textSecondary }
          ]} />
          {conversation.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unread}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.conversationName}>{conversation.name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={12} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.ratingText}>{conversation.rating}</Text>
              </View>
            </View>
            <View style={styles.conversationMeta}>
              <Text style={styles.conversationTime}>{conversation.time}</Text>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(conversation.status) }]} />
            </View>
          </View>
          
          <View style={styles.tripContainer}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.tripRoute}>{conversation.tripRoute}</Text>
          </View>
          
          <View style={styles.conversationFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {conversation.lastMessage}
            </Text>
            {conversation.type === 'negotiation' && (
              <View style={styles.negotiationBadge}>
                <DollarSign size={12} color={Colors.warning} />
                <Text style={styles.negotiationText}>R{conversation.currentOffer}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderMessage = (message: any, providerAvatar: string, riderAvatar: string) => {
    const isRider = message.sender === 'rider';
    const isProvider = message.sender === 'provider';
    return (
      <View key={message.id} style={[styles.messageRow, isRider ? styles.riderRow : styles.providerRow]}>
        {isProvider && (
          <View style={styles.messageAvatarContainer}>
            <Image source={{ uri: providerAvatar }} style={styles.chatAvatar} />
          </View>
        )}
        <View style={[styles.messageBubble, isRider ? styles.riderBubble : styles.providerBubble]}>
          {message.type === 'text' && (
            <Text style={[styles.messageText, isRider ? styles.riderText : styles.providerText]}>
              {message.text}
            </Text>
          )}
          {(message.type === 'offer' || message.type === 'counter-offer') && (
            <View style={styles.offerContainer}>
              <LinearGradient
                colors={[Colors.warning + '20', Colors.warning + '10']}
                style={styles.offerGradient}
              >
                <View style={styles.offerHeader}>
                  <DollarSign size={16} color={Colors.warning} />
                  <Text style={styles.offerLabel}>
                    {message.type === 'offer' ? 'Price Offer' : 'Counter Offer'}
                  </Text>
                </View>
                <Text style={styles.offerAmount}>R{message.offerAmount}</Text>
                <Text style={styles.originalPrice}>was R{message.originalPrice}</Text>
              </LinearGradient>
            </View>
          )}
          <Text style={styles.messageTime}>{message.time}</Text>
        </View>
        {isRider && (
          <View style={styles.messageAvatarContainer}>
            <Image source={{ uri: riderAvatar }} style={styles.chatAvatar} />
          </View>
        )}
      </View>
    );
  };

  const renderChatView = () => {
    const conversation = conversations.find(c => c.id === selectedChat);
    if (!conversation) return null;
    const messages = chatThreads[selectedChat!] || [];
    const quickResponses = quickResponsesMap[selectedChat!] || [];
    const riderAvatar = 'https://randomuser.me/api/portraits/men/32.jpg';
    
    return (
      <View style={styles.chatContainer}>
        {/* Enhanced Chat Header */}
        <LinearGradient
          colors={[Colors.background, Colors.surface]}
          style={styles.chatHeader}
        >
          <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <View style={styles.chatAvatarContainer}>
              <Image source={{ uri: conversation.avatar }} style={styles.chatHeaderAvatar} />
              <View style={[
                styles.onlineIndicator,
                { backgroundColor: conversation.isOnline ? Colors.success : Colors.textSecondary }
              ]} />
            </View>
            <View style={styles.chatHeaderDetails}>
              <View style={styles.chatHeaderName}>
                <Text style={styles.chatName}>{conversation.name}</Text>
                <View style={styles.providerBadge}>
                  <Users size={10} color={Colors.primary} />
                  <Text style={styles.providerText}>Driver</Text>
                </View>
              </View>
              <View style={styles.chatHeaderMeta}>
                <MapPin size={12} color={Colors.textSecondary} />
                <Text style={styles.chatRoute}>{conversation.tripRoute}</Text>
              </View>
            </View>
          </View>
          <View style={styles.chatActions}>
            <TouchableOpacity style={styles.chatActionButton}>
              <Phone size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatActionButton}>
              <Video size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.messagesContent}>
            {messages.map(m => renderMessage(m, conversation.avatar, riderAvatar))}
          </View>
        </ScrollView>

        {/* Quick Responses */}
        <View style={styles.quickResponsesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickResponsesContent}>
              {quickResponses.map((resp, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.quickResponseButton} 
                  onPress={() => setMessageText(resp)}
                >
                  <LinearGradient
                    colors={[Colors.surface, Colors.background]}
                    style={styles.quickResponseGradient}
                  >
                    <Text style={styles.quickResponseText}>{resp}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Enhanced Message Input */}
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={[Colors.background, Colors.surface]}
            style={styles.inputGradient}
          >
            <TouchableOpacity style={styles.attachButton}>
              <Paperclip size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type your message..."
              placeholderTextColor={Colors.textSecondary}
              multiline
            />
            <TouchableOpacity style={styles.sendButton}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.sendButtonGradient}
              >
                <Send size={18} color={Colors.background} />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderConversationsList = () => (
    <View style={styles.conversationsContainer}>
      {/* Enhanced Search Bar */}
      <View style={styles.searchContainer}>
        <LinearGradient
          colors={[Colors.surface, Colors.background]}
          style={styles.searchGradient}
        >
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search conversations..."
            placeholderTextColor={Colors.textSecondary}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>

      {/* Conversations List */}
      <ScrollView style={styles.conversationsList} showsVerticalScrollIndicator={false}>
        {conversations
          .filter(conv => 
            searchText === '' || 
            conv.name.toLowerCase().includes(searchText.toLowerCase()) ||
            conv.tripRoute.toLowerCase().includes(searchText.toLowerCase())
          )
          .map(renderConversationItem)}
      </ScrollView>
    </View>
  );

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
                <MessageCircle size={24} color={Colors.background} />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Messages</Text>
              <Text style={styles.subtitle}>Stay connected with drivers</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.newChatButton}>
            <Plus size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {selectedChat ? renderChatView() : renderConversationsList()}
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
    fontSize: FontSizes['2xl'],
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  newChatButton: {
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  conversationsContainer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.text,
    marginLeft: 12,
  },
  clearSearch: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    padding: 4,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  conversationGradient: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectedConversation: {
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conversationName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  conversationMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  conversationTime: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tripContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  tripRoute: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  negotiationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  negotiationText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.bold,
    color: Colors.warning,
  },
  // Chat View Styles
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: FontSizes.xl,
    color: Colors.primary,
    fontFamily: Fonts.heading.bold,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  chatHeaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  chatHeaderDetails: {
    flex: 1,
  },
  chatHeaderName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  chatName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  providerText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.medium,
    color: Colors.primary,
  },
  chatHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chatRoute: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  chatActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatActionButton: {
    padding: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    maxWidth: '85%',
  },
  riderRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  providerRow: {
    alignSelf: 'flex-start',
  },
  messageAvatarContainer: {
    marginHorizontal: 8,
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: width * 0.7,
  },
  riderBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 6,
  },
  providerBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    lineHeight: 20,
  },
  riderText: {
    color: Colors.background,
  },
  providerText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 4,
    opacity: 0.7,
  },
  offerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  offerGradient: {
    padding: 12,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  offerLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.bold,
    color: Colors.warning,
  },
  offerAmount: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  quickResponsesContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  quickResponsesContent: {
    flexDirection: 'row',
    gap: 8,
  },
  quickResponseButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickResponseGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickResponseText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 8,
  },
  sendButtonGradient: {
    padding: 10,
  },
});