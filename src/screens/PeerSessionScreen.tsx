import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { LESSONS } from '../data/lessons';
import { PeerSession, ChatMessage, Lesson } from '../types';
import PeerService from '../services/PeerService';

const { width } = Dimensions.get('window');

const PeerSessionScreen = ({ route, navigation }: any) => {
  const { selectedLanguage, updateProgress } = useApp();
  const [session, setSession] = useState<PeerSession | null>(
    route.params?.session || PeerService.getCurrentSession()
  );
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Listen for peer events
    const handleMessageReceived = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleCardChanged = ({ index }: { index: number }) => {
      if (session) {
        setSession({ ...session, currentCardIndex: index });
        setShowTranslation(false);
      }
    };

    PeerService.on('messageReceived', handleMessageReceived);
    PeerService.on('cardChanged', handleCardChanged);

    return () => {
      PeerService.off('messageReceived', handleMessageReceived);
      PeerService.off('cardChanged', handleCardChanged);
    };
  }, [session]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const availableLessons = LESSONS.filter(
    lesson => lesson.languageId === selectedLanguage?.id
  );

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    PeerService.startLesson(lesson);
    if (session) {
      setSession({ ...session, lesson, status: 'active' });
    }
  };

  const handleFlip = () => {
    setShowTranslation(!showTranslation);
  };

  const handleNext = () => {
    if (selectedLesson && session) {
      const isLastCard = session.currentCardIndex === selectedLesson.vocabulary.length - 1;

      if (isLastCard) {
        Alert.alert(
          'Lesson Complete!',
          'Great job learning together! Continue practicing?',
          [
            {
              text: 'End Session',
              style: 'destructive',
              onPress: handleEndSession,
            },
            {
              text: 'Choose New Lesson',
              onPress: () => setSelectedLesson(null),
            },
          ]
        );

        // Update progress
        const wordIds = selectedLesson.vocabulary.map(v => v.id);
        if (selectedLanguage) {
          updateProgress(selectedLanguage.id, selectedLesson.id, wordIds);
        }
      } else {
        PeerService.nextCard();
      }
    }
  };

  const handlePrevious = () => {
    if (session && session.currentCardIndex > 0) {
      PeerService.previousCard();
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      PeerService.sendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleEndSession = () => {
    PeerService.endSession();
    navigation.goBack();
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const currentUserId = PeerService.getCurrentSession()?.users[0]?.id;
    const isCurrentUser = item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.myMessage : styles.peerMessage,
        ]}
      >
        <Text style={styles.messageSender}>{item.senderName}</Text>
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
    );
  };

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No active session</Text>
        </View>
      </SafeAreaView>
    );
  }

  const peerUser = session.users.find(u => u.id !== session.users[0].id);

  // Lesson selection view
  if (!selectedLesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose a Lesson</Text>
          <Text style={styles.headerSubtitle}>
            Learning with {peerUser?.name || 'Peer'}
          </Text>
        </View>

        <FlatList
          data={availableLessons}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lessonList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.lessonCard}
              onPress={() => handleSelectLesson(item)}
            >
              <Text style={styles.lessonTitle}>{item.title}</Text>
              <Text style={styles.lessonDescription}>{item.description}</Text>
              <Text style={styles.lessonInfo}>
                {item.vocabulary.length} words • {item.difficulty}
              </Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
          <Text style={styles.endButtonText}>End Session</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentWord = selectedLesson.vocabulary[session.currentCardIndex];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.peerName}>👥 Learning with {peerUser?.name}</Text>
          <Text style={styles.progressText}>
            {session.currentCardIndex + 1} / {selectedLesson.vocabulary.length}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Flashcard */}
          <View style={styles.flashcardContainer}>
            <TouchableOpacity
              style={styles.flashcard}
              onPress={handleFlip}
              activeOpacity={0.9}
            >
              <View style={styles.cardContent}>
                <Text style={styles.mainText}>
                  {showTranslation ? currentWord.translation : currentWord.word}
                </Text>
                {showTranslation && currentWord.pronunciation && (
                  <Text style={styles.pronunciation}>{currentWord.pronunciation}</Text>
                )}
                {showTranslation && currentWord.example && (
                  <Text style={styles.example}>{currentWord.example}</Text>
                )}
                <Text style={styles.tapHint}>Tap to flip</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.controls}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  session.currentCardIndex === 0 && styles.disabledButton,
                ]}
                onPress={handlePrevious}
                disabled={session.currentCardIndex === 0}
              >
                <Text
                  style={[
                    styles.navButtonText,
                    session.currentCardIndex === 0 && styles.disabledText,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                  {session.currentCardIndex === selectedLesson.vocabulary.length - 1
                    ? 'Complete'
                    : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Chat */}
          <View style={styles.chatContainer}>
            <Text style={styles.chatTitle}>Chat</Text>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              style={styles.messagesContainer}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message..."
                placeholderTextColor="#BDC3C7"
                returnKeyType="send"
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  lessonList: {
    padding: 20,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  lessonInfo: {
    fontSize: 12,
    color: '#4A90E2',
  },
  endButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F4FF',
  },
  peerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  content: {
    flex: 1,
  },
  flashcardContainer: {
    flex: 1,
    padding: 20,
  },
  flashcard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  mainText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  pronunciation: {
    fontSize: 16,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  example: {
    fontSize: 14,
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 16,
  },
  tapHint: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: '#BDC3C7',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  disabledButton: {
    borderColor: '#BDC3C7',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  disabledText: {
    color: '#BDC3C7',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatContainer: {
    height: 250,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8F4FF',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F4FF',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 12,
  },
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
  },
  peerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F4FF',
  },
  messageSender: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    color: '#2C3E50',
  },
  messageText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F4FF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#7F8C8D',
  },
});

export default PeerSessionScreen;
