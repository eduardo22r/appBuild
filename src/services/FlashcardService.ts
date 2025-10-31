import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserFlashcard {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  languageId: string;
  createdBy: string; // user ID
  createdAt: Date;
  sharedWith?: string[]; // array of user IDs
  isPublic?: boolean;
}

const FLASHCARDS_KEY = '@user_flashcards';
const SHARED_FLASHCARDS_KEY = '@shared_flashcards';

class FlashcardService {
  /**
   * Get all user flashcards
   */
  async getUserFlashcards(): Promise<UserFlashcard[]> {
    try {
      const data = await AsyncStorage.getItem(FLASHCARDS_KEY);
      if (!data) return [];

      const cards = JSON.parse(data);
      // Convert date strings back to Date objects
      return cards.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
      }));
    } catch (error) {
      console.error('Error loading flashcards:', error);
      return [];
    }
  }

  /**
   * Get flashcards for a specific language
   */
  async getFlashcardsByLanguage(languageId: string): Promise<UserFlashcard[]> {
    const allCards = await this.getUserFlashcards();
    return allCards.filter(card => card.languageId === languageId);
  }

  /**
   * Check if a flashcard is a duplicate
   */
  async isDuplicate(word: string, languageId: string): Promise<boolean> {
    const cards = await this.getFlashcardsByLanguage(languageId);
    const normalizedWord = word.trim().toLowerCase();

    return cards.some(card =>
      card.word.trim().toLowerCase() === normalizedWord
    );
  }

  /**
   * Create a new flashcard
   */
  async createFlashcard(
    word: string,
    translation: string,
    languageId: string,
    userId: string,
    pronunciation?: string
  ): Promise<{ success: boolean; message: string; card?: UserFlashcard }> {
    try {
      // Check for duplicates
      const isDupe = await this.isDuplicate(word, languageId);
      if (isDupe) {
        return {
          success: false,
          message: 'This flashcard already exists!',
        };
      }

      // Validate input
      if (!word.trim() || !translation.trim()) {
        return {
          success: false,
          message: 'Word and translation are required',
        };
      }

      const newCard: UserFlashcard = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        word: word.trim(),
        translation: translation.trim(),
        pronunciation: pronunciation?.trim(),
        languageId,
        createdBy: userId,
        createdAt: new Date(),
        sharedWith: [],
        isPublic: false,
      };

      const cards = await this.getUserFlashcards();
      cards.push(newCard);

      await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));

      return {
        success: true,
        message: 'Flashcard created successfully!',
        card: newCard,
      };
    } catch (error) {
      console.error('Error creating flashcard:', error);
      return {
        success: false,
        message: 'Failed to create flashcard',
      };
    }
  }

  /**
   * Update an existing flashcard
   */
  async updateFlashcard(
    id: string,
    updates: Partial<UserFlashcard>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const cards = await this.getUserFlashcards();
      const index = cards.findIndex(card => card.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Flashcard not found',
        };
      }

      cards[index] = { ...cards[index], ...updates };
      await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));

      return {
        success: true,
        message: 'Flashcard updated successfully',
      };
    } catch (error) {
      console.error('Error updating flashcard:', error);
      return {
        success: false,
        message: 'Failed to update flashcard',
      };
    }
  }

  /**
   * Delete a flashcard
   */
  async deleteFlashcard(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const cards = await this.getUserFlashcards();
      const filtered = cards.filter(card => card.id !== id);

      await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(filtered));

      return {
        success: true,
        message: 'Flashcard deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      return {
        success: false,
        message: 'Failed to delete flashcard',
      };
    }
  }

  /**
   * Share a flashcard with peers
   */
  async shareFlashcard(
    cardId: string,
    shareCode: string
  ): Promise<{ success: boolean; message: string; code?: string }> {
    try {
      const cards = await this.getUserFlashcards();
      const card = cards.find(c => c.id === cardId);

      if (!card) {
        return { success: false, message: 'Flashcard not found' };
      }

      // Generate share code
      const code = shareCode || `FC${Date.now().toString(36).toUpperCase()}`;

      // Store in shared flashcards
      const sharedData = await AsyncStorage.getItem(SHARED_FLASHCARDS_KEY);
      const sharedCards = sharedData ? JSON.parse(sharedData) : {};

      sharedCards[code] = {
        ...card,
        shareCode: code,
        sharedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(SHARED_FLASHCARDS_KEY, JSON.stringify(sharedCards));

      return {
        success: true,
        message: 'Share code generated!',
        code,
      };
    } catch (error) {
      console.error('Error sharing flashcard:', error);
      return {
        success: false,
        message: 'Failed to share flashcard',
      };
    }
  }

  /**
   * Import a flashcard using share code
   */
  async importFlashcard(
    shareCode: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const sharedData = await AsyncStorage.getItem(SHARED_FLASHCARDS_KEY);
      if (!sharedData) {
        return { success: false, message: 'Invalid share code' };
      }

      const sharedCards = JSON.parse(sharedData);
      const sharedCard = sharedCards[shareCode];

      if (!sharedCard) {
        return { success: false, message: 'Invalid share code' };
      }

      // Check if already exists
      const isDupe = await this.isDuplicate(sharedCard.word, sharedCard.languageId);
      if (isDupe) {
        return {
          success: false,
          message: 'You already have this flashcard!',
        };
      }

      // Create new card for this user
      const result = await this.createFlashcard(
        sharedCard.word,
        sharedCard.translation,
        sharedCard.languageId,
        userId,
        sharedCard.pronunciation
      );

      if (result.success) {
        return {
          success: true,
          message: `Imported: ${sharedCard.word} → ${sharedCard.translation}`,
        };
      }

      return result;
    } catch (error) {
      console.error('Error importing flashcard:', error);
      return {
        success: false,
        message: 'Failed to import flashcard',
      };
    }
  }

  /**
   * Bulk share multiple flashcards
   */
  async shareFlashcardSet(
    cardIds: string[],
    setName: string
  ): Promise<{ success: boolean; message: string; code?: string }> {
    try {
      const cards = await this.getUserFlashcards();
      const selectedCards = cards.filter(c => cardIds.includes(c.id));

      if (selectedCards.length === 0) {
        return { success: false, message: 'No cards to share' };
      }

      const code = `SET${Date.now().toString(36).toUpperCase()}`;

      const sharedData = await AsyncStorage.getItem(SHARED_FLASHCARDS_KEY);
      const sharedCards = sharedData ? JSON.parse(sharedData) : {};

      sharedCards[code] = {
        type: 'set',
        name: setName,
        cards: selectedCards,
        sharedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(SHARED_FLASHCARDS_KEY, JSON.stringify(sharedCards));

      return {
        success: true,
        message: `Shared ${selectedCards.length} cards!`,
        code,
      };
    } catch (error) {
      console.error('Error sharing flashcard set:', error);
      return {
        success: false,
        message: 'Failed to share flashcard set',
      };
    }
  }

  /**
   * Import a flashcard set
   */
  async importFlashcardSet(
    shareCode: string,
    userId: string
  ): Promise<{ success: boolean; message: string; imported?: number }> {
    try {
      const sharedData = await AsyncStorage.getItem(SHARED_FLASHCARDS_KEY);
      if (!sharedData) {
        return { success: false, message: 'Invalid share code' };
      }

      const sharedCards = JSON.parse(sharedData);
      const sharedSet = sharedCards[shareCode];

      if (!sharedSet || sharedSet.type !== 'set') {
        return { success: false, message: 'Invalid share code' };
      }

      let imported = 0;
      for (const card of sharedSet.cards) {
        const isDupe = await this.isDuplicate(card.word, card.languageId);
        if (!isDupe) {
          await this.createFlashcard(
            card.word,
            card.translation,
            card.languageId,
            userId,
            card.pronunciation
          );
          imported++;
        }
      }

      return {
        success: true,
        message: `Imported ${imported} of ${sharedSet.cards.length} cards`,
        imported,
      };
    } catch (error) {
      console.error('Error importing flashcard set:', error);
      return {
        success: false,
        message: 'Failed to import flashcard set',
      };
    }
  }

  /**
   * Clear all user flashcards (for testing/reset)
   */
  async clearAllFlashcards(): Promise<void> {
    await AsyncStorage.removeItem(FLASHCARDS_KEY);
  }
}

export default new FlashcardService();
