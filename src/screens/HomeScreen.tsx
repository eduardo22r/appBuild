import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { LESSONS } from '../data/lessons';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

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
  const streak = currentProgress?.streak || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with gradient background */}
        <LinearGradient
          colors={Colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {userName}! 👋</Text>
              <Text style={styles.subtitle}>Ready to learn today?</Text>
            </View>
            <View style={styles.languageFlagContainer}>
              <Text style={styles.languageFlag}>{selectedLanguage?.flag}</Text>
            </View>
          </View>

          <View style={styles.languageCard}>
            <Text style={styles.cardTitle}>Learning {selectedLanguage?.name}</Text>
            <Text style={styles.nativeName}>{selectedLanguage?.nativeName}</Text>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak} day streak</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statIconContainer}
              >
                <Text style={styles.statIcon}>📚</Text>
              </LinearGradient>
              <Text style={styles.statNumber}>{completedLessonsCount}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#10B981', '#34D399']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statIconContainer}
              >
                <Text style={styles.statIcon}>✨</Text>
              </LinearGradient>
              <Text style={styles.statNumber}>{masteredWords}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#3B82F6', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statIconContainer}
              >
                <Text style={styles.statIcon}>🏆</Text>
              </LinearGradient>
              <Text style={styles.statNumber}>{totalScore}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#F59E0B', '#EF4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statIconContainer}
              >
                <Text style={styles.statIcon}>⚡</Text>
              </LinearGradient>
              <Text style={styles.statNumber}>{streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Lessons')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonIcon}>🚀</Text>
              <Text style={styles.primaryButtonText}>Start Learning</Text>
            </LinearGradient>
          </TouchableOpacity>

          {completedLessonsCount > 0 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                const firstLesson = lessonsForLanguage[0];
                if (firstLesson) {
                  navigation.navigate('Quiz', { lesson: firstLesson });
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonIcon}>🎯</Text>
              <Text style={styles.secondaryButtonText}>Practice Quiz</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('PeerLearning')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonIcon}>👥</Text>
            <Text style={styles.secondaryButtonText}>Learn Together</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressPercentage}>
              {totalLessons > 0
                ? Math.round((completedLessonsCount / totalLessons) * 100)
                : 0}
              %
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <LinearGradient
                colors={Colors.gradients.success}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarFill,
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
          </View>

          <Text style={styles.progressText}>
            {completedLessonsCount} of {totalLessons} lessons completed
          </Text>
        </View>

        {/* Motivational Card */}
        <View style={styles.motivationalCard}>
          <Text style={styles.motivationalEmoji}>💪</Text>
          <Text style={styles.motivationalTitle}>Keep Going!</Text>
          <Text style={styles.motivationalText}>
            {completedLessonsCount === 0
              ? "Start your first lesson today and begin your language journey!"
              : completedLessonsCount < totalLessons / 2
              ? "You're making great progress! Keep up the momentum."
              : "Almost there! You're doing amazing!"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  headerGradient: {
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    marginBottom: -Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.weights.medium,
  },
  languageFlagContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 32,
  },
  languageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    backdropFilter: 'blur(10px)',
  },
  cardTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  nativeName: {
    fontSize: Typography.sizes.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.weights.medium,
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  streakText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  statsGrid: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statIcon: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  primaryButtonIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  secondaryButtonIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  secondaryButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  progressContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  progressPercentage: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
  },
  progressBarContainer: {
    marginBottom: Spacing.sm,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  motivationalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  motivationalEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  motivationalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  motivationalText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HomeScreen;
