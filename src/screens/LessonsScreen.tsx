import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { LESSONS } from '../data/lessons';
import { Lesson } from '../types';

const LessonsScreen = ({ navigation }: any) => {
  const { selectedLanguage, userProgress } = useApp();

  const lessonsForLanguage = LESSONS.filter(
    (lesson) => lesson.languageId === selectedLanguage?.id
  );

  const currentProgress = userProgress.find(
    (p) => p.languageId === selectedLanguage?.id
  );

  const isLessonCompleted = (lessonId: string) => {
    return currentProgress?.completedLessons.includes(lessonId) || false;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#27AE60';
      case 'intermediate':
        return '#F39C12';
      case 'advanced':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  const handleLessonPress = (lesson: Lesson) => {
    navigation.navigate('Flashcard', { lesson });
  };

  const renderLessonItem = ({ item }: { item: Lesson }) => {
    const completed = isLessonCompleted(item.id);

    return (
      <TouchableOpacity
        style={styles.lessonCard}
        onPress={() => handleLessonPress(item)}
      >
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          {completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.lessonDescription}>{item.description}</Text>
        <View style={styles.lessonFooter}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>
              {item.difficulty.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.wordCount}>{item.vocabulary.length} words</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lessons</Text>
        <Text style={styles.subtitle}>
          {selectedLanguage?.name} - {selectedLanguage?.nativeName}
        </Text>
      </View>
      {lessonsForLanguage.length > 0 ? (
        <FlatList
          data={lessonsForLanguage}
          renderItem={renderLessonItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No lessons available for this language yet.
          </Text>
        </View>
      )}
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  list: {
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
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  checkmark: {
    fontSize: 24,
    color: '#27AE60',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  wordCount: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});

export default LessonsScreen;
