import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Lesson, Vocabulary } from '../types';

const { width } = Dimensions.get('window');

const FlashcardScreen = ({ route, navigation }: any) => {
  const { lesson } = route.params as { lesson: Lesson };
  const { updateProgress, selectedLanguage } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const currentWord = lesson.vocabulary[currentIndex];
  const isLastCard = currentIndex === lesson.vocabulary.length - 1;

  const handleFlip = () => {
    setShowTranslation(!showTranslation);
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
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  ((currentIndex + 1) / lesson.vocabulary.length) * 100
                }%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {lesson.vocabulary.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
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
              <Text style={styles.pronunciation}>
                {currentWord.pronunciation}
              </Text>
            )}
            {showTranslation && currentWord.example && (
              <Text style={styles.example}>{currentWord.example}</Text>
            )}
            <Text style={styles.tapHint}>Tap to flip</Text>
          </View>
        </TouchableOpacity>
      </View>

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
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLastCard ? 'Complete' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  closeButton: {
    fontSize: 28,
    color: '#7F8C8D',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  placeholder: {
    width: 28,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E8F4FF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  flashcard: {
    width: width - 40,
    height: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  mainText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  pronunciation: {
    fontSize: 18,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  example: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 20,
  },
  tapHint: {
    position: 'absolute',
    bottom: 20,
    fontSize: 14,
    color: '#BDC3C7',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  disabledButton: {
    borderColor: '#BDC3C7',
  },
  navButtonText: {
    fontSize: 16,
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
    padding: 16,
    marginLeft: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FlashcardScreen;
