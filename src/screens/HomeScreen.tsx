import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { LESSONS } from '../data/lessons';

const HomeScreen = ({ navigation }: any) => {
  const { selectedLanguage, userProgress, userName } = useApp();

  const currentProgress = userProgress.find(
    (p) => p.languageId === selectedLanguage?.id
  );

  const lessonsForLanguage = LESSONS.filter(
    (lesson) => lesson.languageId === selectedLanguage?.id
  );

  const completedLessonsCount = currentProgress?.completedLessons.length || 0;
  const totalLessons = lessonsForLanguage.length;
  const masteredWords = currentProgress?.masteredWords.length || 0;
  const totalScore = currentProgress?.score || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {userName}!</Text>
          <Text style={styles.languageFlag}>{selectedLanguage?.flag}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Learning {selectedLanguage?.name}</Text>
          <Text style={styles.nativeName}>{selectedLanguage?.nativeName}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedLessonsCount}</Text>
            <Text style={styles.statLabel}>Lessons Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{masteredWords}</Text>
            <Text style={styles.statLabel}>Words Mastered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalScore}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => navigation.navigate('Lessons')}
          >
            <Text style={styles.actionButtonText}>Start Learning</Text>
          </TouchableOpacity>

          {completedLessonsCount > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => {
                const firstLesson = lessonsForLanguage[0];
                if (firstLesson) {
                  navigation.navigate('Quiz', { lesson: firstLesson });
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>Practice Quiz</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    totalLessons > 0
                      ? (completedLessonsCount / totalLessons) * 100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedLessonsCount} of {totalLessons} lessons completed
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  languageFlag: {
    fontSize: 48,
  },
  card: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  nativeName: {
    fontSize: 18,
    color: '#E8F4FF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E8F4FF',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

export default HomeScreen;
