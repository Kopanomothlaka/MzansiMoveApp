import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Search, MessageCircle, Phone, Mail, ChevronRight, ChevronDown, HelpCircle, FileText, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Fonts';

export default function HelpCenterScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: 'How do I book a ride?',
      answer: 'To book a ride, simply search for your destination, select a service provider, and confirm your booking. You can also place bids for better prices.',
    },
    {
      id: '2',
      question: 'How does the bidding system work?',
      answer: 'The bidding system allows you to offer a price for your ride. Service providers can accept your bid or you can increase it to get a better chance of finding a ride.',
    },
    {
      id: '3',
      question: 'What if my service provider doesn\'t show up?',
      answer: 'If your service provider doesn\'t show up within 5 minutes, you can cancel the ride and book with another provider. You won\'t be charged for cancelled rides.',
    },
    {
      id: '4',
      question: 'How do I pay for my rides?',
      answer: 'You can pay using credit/debit cards, mobile money, or cash. All payment methods are secure and encrypted.',
    },
    {
      id: '5',
      question: 'Can I cancel a ride after booking?',
      answer: 'Yes, you can cancel a ride up to 2 minutes after booking without any charges. Later cancellations may incur a small fee.',
    },
    {
      id: '6',
      question: 'How do I report an issue?',
      answer: 'You can report issues through the app by going to Help Center > Contact Support, or by calling our 24/7 support line.',
    },
  ];

  const helpCategories = [
    {
      id: 'booking',
      title: 'Booking & Rides',
      subtitle: 'Learn how to book rides and use the app',
      icon: FileText,
      color: Colors.primary,
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      subtitle: 'Payment methods and billing questions',
      icon: Shield,
      color: Colors.success,
    },
    {
      id: 'safety',
      title: 'Safety & Security',
      subtitle: 'Safety features and security measures',
      icon: Shield,
      color: Colors.warning,
    },
    {
      id: 'account',
      title: 'Account & Profile',
      subtitle: 'Account management and profile settings',
      icon: HelpCircle,
      color: Colors.info,
    },
  ];

  const contactMethods = [
    {
      id: 'chat',
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      icon: MessageCircle,
      action: () => Alert.alert('Live Chat', 'Connecting you to our support team...'),
    },
    {
      id: 'phone',
      title: 'Call Support',
      subtitle: 'Speak with a representative',
      icon: Phone,
      action: () => Alert.alert('Call Support', 'Calling our support line...'),
    },
    {
      id: 'email',
      title: 'Email Support',
      subtitle: 'Send us an email',
      icon: Mail,
      action: () => Alert.alert('Email Support', 'Opening email client...'),
    },
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFAQToggle = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const renderFAQItem = (faq: any) => (
    <View key={faq.id} style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => handleFAQToggle(faq.id)}
      >
        <Text style={styles.faqQuestionText}>{faq.question}</Text>
        {expandedFAQ === faq.id ? (
          <ChevronDown size={20} color={Colors.textSecondary} />
        ) : (
          <ChevronRight size={20} color={Colors.textSecondary} />
        )}
      </TouchableOpacity>
      {expandedFAQ === faq.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );

  const renderHelpCategory = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={styles.helpCategory}
      onPress={() => Alert.alert(category.title, 'This would open detailed help for this category.')}
    >
      <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
        <category.icon size={24} color={category.color} />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
      </View>
      <ChevronRight size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderContactMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={styles.contactMethod}
      onPress={method.action}
    >
      <View style={styles.contactIcon}>
        <method.icon size={24} color={Colors.primary} />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{method.title}</Text>
        <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
      </View>
      <ChevronRight size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Help Center</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for help..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Help Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Help Categories</Text>
            <View style={styles.helpCategories}>
              {helpCategories.map(renderHelpCategory)}
            </View>
          </View>

          {/* Contact Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            <View style={styles.contactMethods}>
              {contactMethods.map(renderContactMethod)}
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqsList}>
              {filteredFAQs.map(renderFAQItem)}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => Alert.alert('Report Issue', 'This would open the issue reporting form.')}
              >
                <View style={styles.quickActionIcon}>
                  <HelpCircle size={24} color={Colors.primary} />
                </View>
                <Text style={styles.quickActionText}>Report an Issue</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => Alert.alert('Feedback', 'This would open the feedback form.')}
              >
                <View style={styles.quickActionIcon}>
                  <MessageCircle size={24} color={Colors.primary} />
                </View>
                <Text style={styles.quickActionText}>Send Feedback</Text>
              </TouchableOpacity>
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
  searchContainer: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
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
  helpCategories: {
    gap: 12,
  },
  helpCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  contactMethods: {
    gap: 12,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.heading.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  faqsList: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body.medium,
    color: Colors.text,
    textAlign: 'center',
  },
}); 