import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  Alert,
  Animated,
  ToastAndroid,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Lesson, Vocabulary } from '../types';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import FlashcardService from '../services/FlashcardService';

const { width } = Dimensions.get('window');

type PracticeMode = 'flip' | 'type';

const FlashcardScreen = ({ route, navigation }: any) => {
  const { lesson } = route.params as { lesson: Lesson };
  const { updateProgress, selectedLanguage, authUser } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('flip');
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());

  const currentWord = lesson.vocabulary[currentIndex];
  const isLastCard = currentIndex === lesson.vocabulary.length - 1;
  const isCardSaved = savedCards.has(currentWord.word);

  useEffect(() => {
    // Reset answer state when card changes
    setUserAnswer('');
    setIsAnswerCorrect(null);
    setShowAnswer(false);
    setShowTranslation(false);

    // Fade animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

  const handleFlip = () => {
    setShowTranslation(!showTranslation);
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      Alert.alert('Empty Answer', 'Please type your answer first');
      return;
    }

    const correct = userAnswer.trim().toLowerCase() === currentWord.translation.toLowerCase();
    setIsAnswerCorrect(correct);
    setShowAnswer(true);

    if (correct) {
      setTimeout(() => {
        handleNext();
      }, 1500);
    }
  };

  const skipTyping = () => {
    setShowAnswer(true);
    setIsAnswerCorrect(null);
  };

  const handleNext = () => {
    if (isLastCard) {
      // Complete the lesson
      const wordIds = lesson.vocabulary.map((v) => v.id);
      if (selectedLanguage) {
        updateProgress(selectedLanguage.id, lesson.id, wordIds);
      }
      navigation.goBack();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(currentIndex + 1);
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(currentIndex - 1);
      });
    }
  };

  const handleSaveFlashcard = async () => {
    if (!authUser || !selectedLanguage) {
      Alert.alert('Login Required', 'Please log in to save flashcards');
      return;
    }

    if (isCardSaved) {
      Alert.alert('Already Saved', 'This card is already in your collection!');
      return;
    }

    const result = await FlashcardService.createFlashcard(
      currentWord.word,
      currentWord.translation,
      selectedLanguage.id,
      authUser.uid,
      currentWord.pronunciation
    );

    if (result.success) {
      setSavedCards(prev => new Set(prev).add(currentWord.word));

      // Show platform-specific feedback
      if (Platform.OS === 'android') {
        ToastAndroid.show('✅ Saved to My Flashcards!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success!', 'Card saved to My Flashcards');
      }
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with mode switcher */}
      <LinearGradient
        colors={Colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
          <TouchableOpacity
            onPress={handleSaveFlashcard}
            style={styles.saveButton}
            disabled={isCardSaved}
          >
            <Text style={[styles.saveButtonText, isCardSaved && styles.saveButtonTextSaved]}>
              {isCardSaved ? '✓' : '💾'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mode Switcher */}
        <View style={styles.modeSwitcher}>
          <TouchableOpacity
            style={[styles.modeButton, practiceMode === 'flip' && styles.modeButtonActive]}
            onPress={() => setPracticeMode('flip')}
          >
            <Text style={[styles.modeButtonText, practiceMode === 'flip' && styles.modeButtonTextActive]}>
              🔄 Flip Cards
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, practiceMode === 'type' && styles.modeButtonActive]}
            onPress={() => setPracticeMode('type')}
          >
            <Text style={[styles.modeButtonText, practiceMode === 'type' && styles.modeButtonTextActive]}>
              ⌨️ Type Answer
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={Colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressFill,
              {
                width: `${((currentIndex + 1) / lesson.vocabulary.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {lesson.vocabulary.length}
        </Text>
      </View>

      {/* Card Container */}
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        {practiceMode === 'flip' ? (
          // Flip Card Mode
          <TouchableOpacity
            style={styles.flashcard}
            onPress={handleFlip}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={showTranslation ? ['#ffffff', '#f8f9fa'] : Colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <Text style={[styles.mainText, !showTranslation && styles.mainTextWhite]}>
                  {showTranslation ? currentWord.translation : currentWord.word}
                </Text>
                {showTranslation && currentWord.pronunciation && (
                  <Text style={styles.pronunciation}>
                    {currentWord.pronunciation}
                  </Text>
                )}
                {showTranslation && currentWord.example && (
                  <Text style={styles.example}>{currentWord.example}</Text>
                )}
                <Text style={[styles.tapHint, !showTranslation && styles.tapHintWhite]}>
                  Tap to flip
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          // Type Answer Mode
          <View style={styles.flashcard}>
            <View style={styles.cardContent}>
              <Text style={styles.typePrompt}>Translate this word:</Text>
              <Text style={styles.mainText}>{currentWord.word}</Text>
              {currentWord.pronunciation && (
                <Text style={styles.pronunciation}>({currentWord.pronunciation})</Text>
              )}

              <View style={styles.typingArea}>
                <TextInput
                  style={[
                    styles.answerInput,
                    isAnswerCorrect === true && styles.answerInputCorrect,
                    isAnswerCorrect === false && styles.answerInputWrong,
                  ]}
                  placeholder="Type your answer..."
                  placeholderTextColor={Colors.text.tertiary}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  onSubmitEditing={checkAnswer}
                  editable={!showAnswer}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {showAnswer && (
                  <View style={styles.answerFeedback}>
                    {isAnswerCorrect === true && (
                      <View style={styles.correctFeedback}>
                        <Text style={styles.feedbackText}>✅ Correct!</Text>
                      </View>
                    )}
                    {isAnswerCorrect === false && (
                      <View style={styles.wrongFeedback}>
                        <Text style={styles.feedbackText}>❌ Incorrect</Text>
                        <Text style={styles.correctAnswer}>
                          Correct answer: {currentWord.translation}
                        </Text>
                      </View>
                    )}
                    {isAnswerCorrect === null && (
                      <View style={styles.skippedFeedback}>
                        <Text style={styles.correctAnswer}>
                          Answer: {currentWord.translation}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {!showAnswer && (
                <View style={styles.typeActions}>
                  <TouchableOpacity style={styles.skipButton} onPress={skipTyping}>
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.checkButton} onPress={checkAnswer}>
                    <LinearGradient
                      colors={Colors.gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.checkButtonGradient}
                    >
                      <Text style={styles.checkButtonText}>Check</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </Animated.View>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Text
            style={[
              styles.navButtonText,
              currentIndex === 0 && styles.disabledText,
            ]}
          >
            ← Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={practiceMode === 'type' && !showAnswer}
        >
          <LinearGradient
            colors={Colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {isLastCard ? '✓ Complete' : 'Next →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  backButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  headerTitle: {
    flex: 1,
    color: Colors.text.inverse,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  saveButtonText: {
    fontSize: 22,
  },
  saveButtonTextSaved: {
    opacity: 0.6,
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.round,
    padding: Spacing.xs,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.round,
  },
  modeButtonActive: {
    backgroundColor: Colors.surface,
  },
  modeButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modeButtonTextActive: {
    color: Colors.primary,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.round,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  flashcard: {
    width: width - 40,
    minHeight: 400,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.xl,
  },
  cardGradient: {
    flex: 1,
    borderRadius: BorderRadius.xl,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  mainText: {
    fontSize: 42,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  mainTextWhite: {
    color: Colors.text.inverse,
  },
  pronunciation: {
    fontSize: Typography.sizes.lg,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  example: {
    fontSize: Typography.sizes.base,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  tapHint: {
    position: 'absolute',
    bottom: Spacing.lg,
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
    fontWeight: Typography.weights.medium,
  },
  tapHintWhite: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  typePrompt: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    fontWeight: Typography.weights.medium,
  },
  typingArea: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  answerInput: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    borderWidth: 2,
    borderColor: Colors.border,
    textAlign: 'center',
    fontWeight: Typography.weights.semibold,
  },
  answerInputCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  answerInputWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  answerFeedback: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  correctFeedback: {
    padding: Spacing.md,
    backgroundColor: '#ecfdf5',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  wrongFeedback: {
    padding: Spacing.md,
    backgroundColor: '#fef2f2',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#ef4444',
    alignItems: 'center',
  },
  skippedFeedback: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedbackText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  correctAnswer: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.semibold,
  },
  typeActions: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  skipButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skipButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
  },
  checkButton: {
    flex: 2,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  checkButtonGradient: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  checkButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  controls: {
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  navButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  disabledText: {
    color: Colors.text.tertiary,
  },
  nextButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  nextButtonGradient: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
});

export default FlashcardScreen;
