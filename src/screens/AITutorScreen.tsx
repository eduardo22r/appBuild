import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import GeminiService from '../services/GeminiService';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AITutorScreen = () => {
  const { selectedLanguage } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<
    'chat' | 'grammar' | 'translate' | 'culture'
  >('chat');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Set language when component mounts
    if (selectedLanguage) {
      GeminiService.setLanguage(selectedLanguage.name);
    }
    // Add welcome message
    addWelcomeMessage();
  }, [selectedLanguage]);

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Hello! I'm your AI ${selectedLanguage?.name || 'language'} tutor. I'm here to help you practice conversation, correct grammar, translate phrases, and learn about culture. How can I help you today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      let aiResponse = '';

      switch (selectedFeature) {
        case 'chat':
          aiResponse = await GeminiService.chat(userMessage.content);
          break;

        case 'grammar':
          const grammarResult = await GeminiService.correctGrammar(userMessage.content);
          aiResponse = `**Original:** ${grammarResult.original}\n\n**Corrected:** ${grammarResult.corrected}\n\n**Explanation:** ${grammarResult.explanation}`;
          if (grammarResult.mistakes.length > 0) {
            aiResponse += `\n\n**Mistakes:**\n${grammarResult.mistakes.map((m) => `• ${m}`).join('\n')}`;
          }
          break;

        case 'translate':
          const translationResult = await GeminiService.translate(
            userMessage.content,
            'English',
            selectedLanguage?.name || 'Spanish'
          );
          aiResponse = `**Translation:** ${translationResult.translated}`;
          if (translationResult.pronunciation) {
            aiResponse += `\n\n**Pronunciation:** ${translationResult.pronunciation}`;
          }
          if (translationResult.context) {
            aiResponse += `\n\n**Context:** ${translationResult.context}`;
          }
          break;

        case 'culture':
          const cultureInsight = await GeminiService.getCulturalInsight(userMessage.content);
          aiResponse = cultureInsight.insight;
          break;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error getting AI response:', error);

      // Show detailed error message
      const errorMessage = error.message || 'Failed to get AI response. Please try again.';

      // Add error message to chat for better UX
      const errorBubble: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `⚠️ Error: ${errorMessage}\n\nPlease check:\n• Internet connection\n• API key validity\n• Console logs for details`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorBubble]);

      Alert.alert(
        'AI Error',
        errorMessage,
        [
          { text: 'OK', style: 'default' },
          {
            text: 'View Logs',
            onPress: () => console.log('Check the React Native debugger for detailed error logs')
          }
        ]
      );
    } finally {
      setIsLoading(false);
      // Scroll to bottom after message is added
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}
      >
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {!isUser && (
            <View style={styles.aiIcon}>
              <Text style={styles.aiIconText}>🤖</Text>
            </View>
          )}
          <View style={styles.messageContent}>
            <Text style={[styles.messageText, isUser && styles.userMessageText]}>
              {message.content}
            </Text>
            <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const clearChat = () => {
    Alert.alert('Clear Chat', 'Are you sure you want to clear the conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          GeminiService.clearConversationHistory();
          addWelcomeMessage();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>AI Tutor</Text>
        <Text style={styles.headerSubtitle}>
          Learning {selectedLanguage?.flag} {selectedLanguage?.name}
        </Text>
      </LinearGradient>

      {/* Feature Selector */}
      <View style={styles.featureSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.featureButton, selectedFeature === 'chat' && styles.featureButtonActive]}
            onPress={() => setSelectedFeature('chat')}
          >
            <Text
              style={[
                styles.featureButtonText,
                selectedFeature === 'chat' && styles.featureButtonTextActive,
              ]}
            >
              💬 Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.featureButton,
              selectedFeature === 'grammar' && styles.featureButtonActive,
            ]}
            onPress={() => setSelectedFeature('grammar')}
          >
            <Text
              style={[
                styles.featureButtonText,
                selectedFeature === 'grammar' && styles.featureButtonTextActive,
              ]}
            >
              ✏️ Grammar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.featureButton,
              selectedFeature === 'translate' && styles.featureButtonActive,
            ]}
            onPress={() => setSelectedFeature('translate')}
          >
            <Text
              style={[
                styles.featureButtonText,
                selectedFeature === 'translate' && styles.featureButtonTextActive,
              ]}
            >
              🌐 Translate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.featureButton,
              selectedFeature === 'culture' && styles.featureButtonActive,
            ]}
            onPress={() => setSelectedFeature('culture')}
          >
            <Text
              style={[
                styles.featureButtonText,
                selectedFeature === 'culture' && styles.featureButtonTextActive,
              ]}
            >
              🎭 Culture
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <Text style={styles.clearButtonText}>🗑️ Clear</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => renderMessage(message))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loadingText}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={
              selectedFeature === 'chat'
                ? 'Type your message...'
                : selectedFeature === 'grammar'
                ? 'Enter text to check...'
                : selectedFeature === 'translate'
                ? 'Enter text to translate...'
                : 'Ask about culture...'
            }
            placeholderTextColor={Colors.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <LinearGradient
              colors={
                inputText.trim() ? Colors.gradients.primary : ['#cccccc', '#999999']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.weights.medium,
  },
  featureSelector: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  featureButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  featureButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
  },
  featureButtonTextActive: {
    color: Colors.text.inverse,
  },
  clearButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.round,
    backgroundColor: '#fee',
    borderWidth: 1,
    borderColor: '#fcc',
  },
  clearButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: '#c33',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.md,
  },
  messageContainer: {
    marginBottom: Spacing.md,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    flexDirection: 'row',
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  aiBubble: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  aiIconText: {
    fontSize: 18,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  userMessageText: {
    color: Colors.text.inverse,
  },
  timestamp: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  loadingText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.sm,
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
    maxHeight: 100,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 24,
    color: Colors.text.inverse,
  },
});

export default AITutorScreen;
