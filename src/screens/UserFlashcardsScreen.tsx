import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import FlashcardService, { UserFlashcard } from '../services/FlashcardService';
import CreateFlashcardModal from '../components/CreateFlashcardModal';

const UserFlashcardsScreen = ({ navigation }: any) => {
  const { selectedLanguage, authUser } = useApp();
  const [flashcards, setFlashcards] = useState<UserFlashcard[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadFlashcards();
  }, [selectedLanguage, refreshKey]);

  const loadFlashcards = async () => {
    if (!selectedLanguage) return;

    const cards = await FlashcardService.getFlashcardsByLanguage(selectedLanguage.id);
    setFlashcards(cards);
  };

  const handleCreateSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleShare = async (card: UserFlashcard) => {
    const result = await FlashcardService.shareFlashcard(card.id, '');

    if (result.success && result.code) {
      try {
        await Share.share({
          message: `📚 I want to share a flashcard with you!\n\n${card.word} → ${card.translation}\n\nUse code: ${result.code}\n\nImport it in the Language Learning App!`,
          title: 'Share Flashcard',
        });
      } catch (error) {
        // Fallback: show alert with code
        Alert.alert(
          'Share Code',
          `Share this code with your peers:\n\n${result.code}`,
          [
            { text: 'Copy Code', onPress: () => {} },
            { text: 'OK' },
          ]
        );
      }
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleImport = async () => {
    if (!importCode.trim()) {
      Alert.alert('Error', 'Please enter a share code');
      return;
    }

    if (!authUser) {
      Alert.alert('Error', 'Please log in to import flashcards');
      return;
    }

    const result = await FlashcardService.importFlashcard(importCode.trim(), authUser.uid);

    if (result.success) {
      Alert.alert('Success!', result.message);
      setImportCode('');
      setShowImportModal(false);
      setRefreshKey(prev => prev + 1);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleDelete = (card: UserFlashcard) => {
    Alert.alert(
      'Delete Flashcard',
      `Are you sure you want to delete "${card.word}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await FlashcardService.deleteFlashcard(card.id);
            if (result.success) {
              setRefreshKey(prev => prev + 1);
            } else {
              Alert.alert('Error', result.message);
            }
          },
        },
      ]
    );
  };

  const renderFlashcard = (card: UserFlashcard) => (
    <View key={card.id} style={styles.flashcardItem}>
      <View style={styles.flashcardContent}>
        <Text style={styles.flashcardWord}>{card.word}</Text>
        <Text style={styles.flashcardTranslation}>{card.translation}</Text>
        {card.pronunciation && (
          <Text style={styles.flashcardPronunciation}>
            {card.pronunciation}
          </Text>
        )}
      </View>

      <View style={styles.flashcardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(card)}
        >
          <Text style={styles.actionButtonText}>📤</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(card)}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <Text style={styles.headerTitle}>My Flashcards</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {selectedLanguage?.flag} {selectedLanguage?.name}
        </Text>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowCreateModal(true)}
        >
          <LinearGradient
            colors={Colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>➕ Create Card</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowImportModal(true)}
        >
          <Text style={styles.secondaryButtonText}>📥 Import</Text>
        </TouchableOpacity>
      </View>

      {/* Flashcards List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {flashcards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No flashcards yet</Text>
            <Text style={styles.emptyText}>
              Create your own flashcards or import from peers to get started!
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {flashcards.length} {flashcards.length === 1 ? 'Card' : 'Cards'}
            </Text>
            {flashcards.map(renderFlashcard)}
          </>
        )}
      </ScrollView>

      {/* Create Flashcard Modal */}
      {selectedLanguage && authUser && (
        <CreateFlashcardModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          languageId={selectedLanguage.id}
          languageName={selectedLanguage.name}
          userId={authUser.uid}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Import Modal */}
      <Modal
        visible={showImportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={Colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Import Flashcard</Text>
              <Text style={styles.modalSubtitle}>
                Enter the share code from a peer
              </Text>
            </LinearGradient>

            <View style={styles.modalContent}>
              <TextInput
                style={styles.codeInput}
                placeholder="Enter share code (e.g., FC1A2B3C)"
                placeholderTextColor={Colors.text.tertiary}
                value={importCode}
                onChangeText={setImportCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => {
                    setImportCode('');
                    setShowImportModal(false);
                  }}
                >
                  <Text style={styles.cancelModalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.importModalButton]}
                  onPress={handleImport}
                >
                  <LinearGradient
                    colors={Colors.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.importModalButtonGradient}
                  >
                    <Text style={styles.importModalButtonText}>Import</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.weights.medium,
  },
  actionBar: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  primaryButton: {
    flex: 2,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  primaryButtonGradient: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  secondaryButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  flashcardItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  flashcardContent: {
    flex: 1,
  },
  flashcardWord: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  flashcardTranslation: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  flashcardPronunciation: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  flashcardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#fee',
  },
  actionButtonText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '60%',
    ...Shadows.xl,
  },
  modalHeader: {
    padding: Spacing.xl,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  modalTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  modalContent: {
    padding: Spacing.xl,
  },
  codeInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    fontWeight: Typography.weights.semibold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  cancelModalButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
  },
  importModalButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  importModalButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  importModalButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
});

export default UserFlashcardsScreen;
