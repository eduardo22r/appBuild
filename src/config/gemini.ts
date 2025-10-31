// Gemini AI Configuration

export const geminiConfig = {
  apiKey: "AIzaSyB3DChiKfl4Pi_kkcta0eSGh3dvOXMG7f8",
  model: "gemini-1.5-flash", // Fast and efficient for real-time interactions

  // Generation settings
  generationConfig: {
    temperature: 0.7, // Balance between creativity and consistency
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },

  // Safety settings
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
};

// AI Features Configuration
export const aiFeatures = {
  // Enable/disable specific AI features
  conversationPractice: true,
  grammarCorrection: true,
  translation: true,
  culturalInsights: true,
  quizGeneration: true,
  pronunciationTips: true,
  personalizedLessons: true,

  // Context settings
  maxConversationHistory: 20, // Keep last 20 messages for context

  // Rate limiting (to manage API costs)
  maxRequestsPerMinute: 30,
  maxRequestsPerDay: 500,
};
