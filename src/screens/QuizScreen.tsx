import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Lesson, QuizQuestion } from '../types';

const QuizScreen = ({ route, navigation }: any) => {
  const { lesson } = route.params as { lesson: Lesson };

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = () => {
    const quizQuestions: QuizQuestion[] = lesson.vocabulary.map((vocab) => {
      // Get wrong answers from other vocabulary items
      const wrongAnswers = lesson.vocabulary
        .filter((v) => v.id !== vocab.id)
        .map((v) => v.translation)
        .slice(0, 3);

      // Shuffle options
      const options = [vocab.translation, ...wrongAnswers].sort(
        () => Math.random() - 0.5
      );

      return {
        id: vocab.id,
        word: vocab.word,
        correctAnswer: vocab.translation,
        options,
        type: 'multipleChoice',
      };
    });

    setQuestions(quizQuestions);
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return; // Already answered

    setSelectedAnswer(answer);

    const currentQuestion = questions[currentQuestionIndex];
    if (answer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    generateQuiz();
  };

  const handleExit = () => {
    navigation.goBack();
  };

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparing quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>
            {passed ? 'Great Job!' : 'Keep Practicing!'}
          </Text>
          <Text style={styles.resultScore}>
            {score} / {questions.length}
          </Text>
          <Text style={styles.resultPercentage}>{percentage}%</Text>

          <View style={styles.resultButtons}>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} / {questions.length}
        </Text>
      </View>

      <View style={styles.quizContent}>
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Translate:</Text>
          <Text style={styles.questionText}>{currentQuestion.word}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            const showCorrect = selectedAnswer && isCorrect;
            const showIncorrect = isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  showCorrect ? styles.correctOption : undefined,
                  showIncorrect ? styles.incorrectOption : undefined,
                ]}
                onPress={() => handleAnswerSelect(option)}
                disabled={!!selectedAnswer}
              >
                <Text
                  style={[
                    styles.optionText,
                    (showCorrect || showIncorrect) && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {showCorrect && <Text style={styles.checkmark}>✓</Text>}
                {showIncorrect && <Text style={styles.crossmark}>✗</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  progressContainer: {
    marginTop: 20,
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
  quizContent: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8F4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  correctOption: {
    backgroundColor: '#D4EDDA',
    borderColor: '#27AE60',
  },
  incorrectOption: {
    backgroundColor: '#F8D7DA',
    borderColor: '#E74C3C',
  },
  optionText: {
    fontSize: 18,
    color: '#2C3E50',
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 24,
    color: '#27AE60',
  },
  crossmark: {
    fontSize: 24,
    color: '#E74C3C',
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#7F8C8D',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 10,
  },
  resultPercentage: {
    fontSize: 24,
    color: '#7F8C8D',
    marginBottom: 40,
  },
  resultButtons: {
    width: '100%',
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exitButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  exitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
});

export default QuizScreen;
