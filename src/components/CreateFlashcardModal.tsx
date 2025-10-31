import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import FlashcardService from '../services/FlashcardService';

interface CreateFlashcardModalProps {
  visible: boolean;
  onClose: () => void;
  languageId: string;
  languageName: string;
  userId: string;
  onSuccess?: () => void;
}

const CreateFlashcardModal: React.FC<CreateFlashcardModalProps> = ({
  visible,
  onClose,
  languageId,
  languageName,
  userId,
  onSuccess,
}) => {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!word.trim() || !translation.trim()) {
      Alert.alert('Missing Information', 'Please enter both word and translation.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await FlashcardService.createFlashcard(
        word,
        translation,
        languageId,
        userId,
        pronunciation
      );

      if (result.success) {
        Alert.alert('Success!', result.message);
        setWord('');
        setTranslation('');
        setPronunciation('');
        onSuccess?.();
        onClose();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create flashcard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setWord('');
    setTranslation('');
    setPronunciation('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <LinearGradient
            colors={Colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Create Flashcard</Text>
            <Text style={styles.headerSubtitle}>{languageName}</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Word in {languageName} *</Text>
              <TextInput
                style={styles.input}
                placeholder={`Enter word in ${languageName}`}
                placeholderTextColor={Colors.text.tertiary}
                value={word}
                onChangeText={setWord}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Translation (English) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter English translation"
                placeholderTextColor={Colors.text.tertiary}
                value={translation}
                onChangeText={setTranslation}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pronunciation (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., oh-lah"
                placeholderTextColor={Colors.text.tertiary}
                value={pronunciation}
                onChangeText={setPronunciation}
                editable={!isLoading}
              />
            </View>

            <Text style={styles.hint}>
              💡 Duplicate cards will be automatically detected
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreate}
              disabled={isLoading || !word.trim() || !translation.trim()}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <LinearGradient
                  colors={Colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createButtonGradient}
                >
                  <Text style={styles.createButtonText}>Create Card</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '85%',
    ...Shadows.lg,
  },
  header: {
    padding: Spacing.xl,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
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
  form: {
    padding: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingTop: 0,
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
  },
  createButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
});

export default CreateFlashcardModal;
