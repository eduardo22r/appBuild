import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiConfig, aiFeatures } from '../config/gemini';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GrammarCorrectionResult {
  original: string;
  corrected: string;
  explanation: string;
  mistakes: string[];
}

interface TranslationResult {
  original: string;
  translated: string;
  pronunciation?: string;
  context?: string;
}

interface CulturalInsight {
  topic: string;
  insight: string;
  examples: string[];
}

/**
 * Gemini AI Service for Language Learning
 * Provides AI-powered features to enhance language learning experience
 */
class GeminiService {
  private genAI: GoogleGenerativeAI;
  private conversationHistory: ConversationMessage[] = [];
  private currentLanguage: string = 'Spanish';
  private userLevel: string = 'beginner';

  constructor() {
    this.genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
  }

  /**
   * Set the current learning language
   */
  setLanguage(language: string) {
    this.currentLanguage = language;
    // Clear conversation history when changing language
    this.conversationHistory = [];
  }

  /**
   * Set user's proficiency level
   */
  setUserLevel(level: 'beginner' | 'intermediate' | 'advanced') {
    this.userLevel = level;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ConversationMessage[] {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory() {
    this.conversationHistory = [];
  }

  /**
   * Chat with AI language tutor
   * Provides natural conversation practice
   */
  async chat(userMessage: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: geminiConfig.model,
        generationConfig: geminiConfig.generationConfig as any,
        safetySettings: geminiConfig.safetySettings as any,
      });

      // Build context from conversation history
      const context = this.buildConversationContext();

      const prompt = `You are a friendly and patient ${this.currentLanguage} language tutor. The student is at a ${this.userLevel} level.

${context}

Student's message: "${userMessage}"

Respond naturally in ${this.currentLanguage}, keeping the conversation flowing. If the student makes mistakes, gently correct them. Encourage them to practice more. Keep responses concise (2-3 sentences) and appropriate for their level.

Your response:`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Add to conversation history
      this.addToHistory('user', userMessage);
      this.addToHistory('assistant', text);

      return text;
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  /**
   * Correct grammar mistakes in user's text
   */
  async correctGrammar(text: string): Promise<GrammarCorrectionResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: geminiConfig.model });

      const prompt = `You are a ${this.currentLanguage} grammar expert. Analyze this text and provide corrections.

Text to analyze: "${text}"

Provide your response in this exact JSON format:
{
  "original": "${text}",
  "corrected": "corrected version here",
  "explanation": "brief explanation of changes",
  "mistakes": ["mistake 1", "mistake 2"]
}

Be specific and educational. If there are no mistakes, say so.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      // Fallback if JSON parsing fails
      return {
        original: text,
        corrected: text,
        explanation: response,
        mistakes: [],
      };
    } catch (error) {
      console.error('Error in grammar correction:', error);
      throw new Error('Failed to correct grammar. Please try again.');
    }
  }

  /**
   * Translate text with context
   */
  async translate(
    text: string,
    fromLanguage: string = 'English',
    toLanguage: string = this.currentLanguage
  ): Promise<TranslationResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: geminiConfig.model });

      const prompt = `Translate this text from ${fromLanguage} to ${toLanguage}. Provide context and pronunciation if helpful.

Text: "${text}"

Provide response in this JSON format:
{
  "original": "${text}",
  "translated": "translation here",
  "pronunciation": "phonetic pronunciation if helpful",
  "context": "when/how to use this phrase"
}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      // Fallback
      return {
        original: text,
        translated: response,
        pronunciation: '',
        context: '',
      };
    } catch (error) {
      console.error('Error in translation:', error);
      throw new Error('Failed to translate. Please try again.');
    }
  }

  /**
   * Get cultural insights about the language
   */
  async getCulturalInsight(topic?: string): Promise<CulturalInsight> {
    try {
      const model = this.genAI.getGenerativeModel({ model: geminiConfig.model });

      const prompt = topic
        ? `Share an interesting cultural insight about ${this.currentLanguage} culture related to: ${topic}. Include practical examples.`
        : `Share an interesting cultural insight about ${this.currentLanguage} culture. Include practical examples that would help a language learner.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return {
        topic: topic || 'General Culture',
        insight: response,
        examples: [], // Could parse examples from response if needed
      };
    } catch (error) {
      console.error('Error getting cultural insight:', error);
      throw new Error('Failed to get cultural insight. Please try again.');
    }
  }

  /**
   * Generate a personalized quiz
   */
  async generateQuiz(topic: string, questionCount: number = 5): Promise<any[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: geminiConfig.model });

      const prompt = `Create ${questionCount} multiple choice quiz questions about ${topic} in ${this.currentLanguage} for a ${this.userLevel} level learner.

Format each question as JSON:
{
  "question": "question text",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "correct option",
  "explanation": "why this is correct"
}

Return as a JSON array of questions.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse JSON array
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return questions;
      }

      return [];
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz. Please try again.');
    }
  }

  /**
   * Get pronunciation tips
   */
  async getPronunciationTips(word: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: geminiConfig.model });

      const prompt = `Provide pronunciation tips for the ${this.currentLanguage} word: "${word}"

Include:
1. Phonetic breakdown
2. Audio description (how it sounds)
3. Common mistakes English speakers make
4. Tips for correct pronunciation`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error getting pronunciation tips:', error);
      throw new Error('Failed to get pronunciation tips. Please try again.');
    }
  }

  /**
   * Generate personalized lesson
   */
  async generatePersonalizedLesson(
    weakAreas: string[],
    timeAvailable: number = 15
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: geminiConfig.model });

      const prompt = `Create a personalized ${timeAvailable}-minute ${this.currentLanguage} lesson for a ${this.userLevel} level learner.

Focus areas: ${weakAreas.join(', ')}

Include:
1. Learning objectives
2. Key vocabulary (5-7 words)
3. Grammar point to practice
4. Practice exercise
5. Quick review quiz (3 questions)

Keep it engaging and practical.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating lesson:', error);
      throw new Error('Failed to generate lesson. Please try again.');
    }
  }

  /**
   * Explain a grammar concept
   */
  async explainGrammar(concept: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: geminiConfig.model });

      const prompt = `Explain the ${this.currentLanguage} grammar concept: "${concept}" for a ${this.userLevel} level learner.

Include:
1. Simple explanation
2. Rules and patterns
3. 3-4 clear examples
4. Common mistakes to avoid
5. Practice tip

Keep it clear and concise.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error explaining grammar:', error);
      throw new Error('Failed to explain grammar. Please try again.');
    }
  }

  /**
   * Get conversation starters based on topic
   */
  async getConversationStarters(topic: string): Promise<string[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: geminiConfig.model });

      const prompt = `Generate 5 conversation starters in ${this.currentLanguage} about: ${topic}

These should be appropriate for a ${this.userLevel} level learner. Return as a JSON array of strings.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse JSON array
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const starters = JSON.parse(jsonMatch[0]);
        return starters;
      }

      return [];
    } catch (error) {
      console.error('Error getting conversation starters:', error);
      throw new Error('Failed to get conversation starters. Please try again.');
    }
  }

  /**
   * Build conversation context from history
   */
  private buildConversationContext(): string {
    if (this.conversationHistory.length === 0) {
      return 'This is the start of a new conversation.';
    }

    // Get last few messages for context
    const recentMessages = this.conversationHistory.slice(-6);
    const context = recentMessages
      .map((msg) => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
      .join('\n');

    return `Conversation so far:\n${context}`;
  }

  /**
   * Add message to conversation history
   */
  private addToHistory(role: 'user' | 'assistant', content: string) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
    });

    // Keep only recent messages
    if (this.conversationHistory.length > aiFeatures.maxConversationHistory) {
      this.conversationHistory = this.conversationHistory.slice(
        -aiFeatures.maxConversationHistory
      );
    }
  }
}

// Export singleton instance
export default new GeminiService();
