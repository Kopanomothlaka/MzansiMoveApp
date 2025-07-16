import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MessageCircle, Phone, Video, MoreVertical, Send, DollarSign, Plus, Paperclip } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

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
      status: 'active'
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
      status: 'confirmed'
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
      status: 'pending'
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

  const renderConversationItem = (conversation: any) => (
    <TouchableOpacity
      key={conversation.id}
      style={[
        styles.conversationItem,
        selectedChat === conversation.id && styles.selectedConversation
      ]}
      onPress={() => setSelectedChat(conversation.id)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(conversation.status) }]} />
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{conversation.name}</Text>
          <View style={styles.conversationMeta}>
            <Text style={styles.conversationTime}>{conversation.time}</Text>
            {conversation.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{conversation.unread}</Text>
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.tripRoute}>{conversation.tripRoute}</Text>
        
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
    </TouchableOpacity>
  );

  const renderMessage = (message: any, providerAvatar: string, riderAvatar: string) => {
    const isRider = message.sender === 'rider';
    const isProvider = message.sender === 'provider';
    return (
      <View key={message.id} style={[styles.messageRow, isRider ? styles.riderRow : styles.providerRow]}>
        {isProvider && <Image source={{ uri: providerAvatar }} style={styles.chatAvatar} />}
        <View style={[styles.messageBubble, isRider ? styles.riderBubble : styles.providerBubble]}>
          {message.type === 'text' && (
            <Text style={[styles.messageText, isRider ? styles.riderText : styles.providerText]}>{message.text}</Text>
          )}
          {(message.type === 'offer' || message.type === 'counter-offer') && (
            <View style={styles.offerContainer}>
              <Text style={styles.offerLabel}>{message.type === 'offer' ? 'Price Offer' : 'Counter Offer'}</Text>
              <Text style={styles.offerAmount}>R{message.offerAmount}</Text>
              <Text style={styles.originalPrice}>was R{message.originalPrice}</Text>
            </View>
          )}
          <Text style={styles.messageTime}>{message.time}</Text>
        </View>
        {isRider && <Image source={{ uri: riderAvatar }} style={styles.chatAvatar} />}
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.warning;
      case 'confirmed': return Colors.success;
      case 'pending': return Colors.info;
      default: return Colors.textSecondary;
    }
  };

  const renderChatView = () => {
    const conversation = conversations.find(c => c.id === selectedChat);
    if (!conversation) return null;
    const messages = chatThreads[selectedChat!] || [];
    const quickResponses = quickResponsesMap[selectedChat!] || [];
    const riderAvatar = 'https://randomuser.me/api/portraits/men/32.jpg';
    return (
      <View style={styles.chatContainer}>
        {/* Trip Details Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <Image source={{ uri: conversation.avatar }} style={styles.chatAvatar} />
            <View>
              <Text style={styles.chatName}>{conversation.name} (Provider)</Text>
              <Text style={styles.chatRoute}>{conversation.tripRoute}</Text>
            </View>
          </View>
          <View style={styles.chatActions}>
            <TouchableOpacity style={styles.chatActionButton}>
              <Phone size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatActionButton}>
              <MessageCircle size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Messages */}
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {messages.map(m => renderMessage(m, conversation.avatar, riderAvatar))}
        </ScrollView>
        {/* Quick Responses */}
        <View style={styles.quickResponsesContainer}>
          {quickResponses.map((resp, idx) => (
            <TouchableOpacity key={idx} style={styles.quickResponseButton} onPress={() => setMessageText(resp)}>
              <Text style={styles.quickResponseText}>{resp}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type your message..."
            placeholderTextColor={Colors.textSecondary}
          />
          <TouchableOpacity style={styles.sendButton}>
            <Send size={20} color={Colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderConversationsList = () => (
    <View style={styles.conversationsContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search conversations..."
          placeholderTextColor={Colors.textSecondary}
        />
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontFamily: Fonts.heading.bold,
    color: Colors.text,
  },
  newChatButton: {
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  conversationsContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
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
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedConversation: {
    backgroundColor: Colors.surface,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationTime: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.bold,
    color: Colors.background,
  },
  tripRoute: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginBottom: 4,
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
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  negotiationText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body.bold,
    color: Colors.warning,
    marginLeft: 2,
  },
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
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: FontSizes.xl,
    color: Colors.primary,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
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
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  riderRow: {
    justifyContent: 'flex-end',
  },
  providerRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  riderBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  providerBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
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
  },
  offerContainer: {
    marginBottom: 12,
  },
  offerLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.bold,
    marginBottom: 4,
  },
  offerAmount: {
    fontSize: FontSizes['2xl'],
    fontFamily: Fonts.heading.bold,
  },
  originalPrice: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    textDecorationLine: 'line-through',
  },
  quickResponsesContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  quickResponseButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickResponseText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.regular,
    color: Colors.text,
    backgroundColor: Colors.surface,
    maxHeight: 100,
  },
  sendButton: {
    padding: 12,
    borderRadius: 20,
    marginLeft: 8,
    backgroundColor: Colors.primary,
  },
});