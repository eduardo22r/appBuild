# Language Learning App

A cross-platform mobile application for learning new languages through interactive flashcards, lessons, and quizzes.

## Features

- **Multi-Language Support**: Learn Spanish, French, German, Italian, Portuguese, Japanese, Korean, or Chinese
- **Interactive Flashcards**: Flip cards to see translations, pronunciations, and example sentences
- **Structured Lessons**: Progressive lessons organized by difficulty level (Beginner, Intermediate, Advanced)
- **Quiz Mode**: Test your knowledge with multiple-choice quizzes
- **Progress Tracking**: Track completed lessons, mastered words, and scores
- **User Profiles**: Personalize your learning experience with custom profiles
- **Peer-to-Peer Learning**: Connect with other learners to study together in real-time
- **Live Chat**: Chat with your learning partner during collaborative sessions
- **Collaborative Flashcards**: Study flashcards together and progress at the same pace
- **Native Navigation**: Built-in back button support for easy navigation
- **Cross-Platform**: Works on iOS, Android, and Web

## Tech Stack

- **React Native** with **Expo** for cross-platform development
- **TypeScript** for type safety
- **React Navigation** (Stack + Tab Navigation) with native back button support
- **AsyncStorage** for local data persistence
- **Context API** for state management
- **Socket.io Client** for real-time peer-to-peer communication (architecture ready)

## Project Structure

```
language-learning-app/
├── App.tsx                          # Main app component
├── src/
│   ├── context/
│   │   └── AppContext.tsx           # Global app state and context
│   ├── data/
│   │   ├── languages.ts             # Available languages data
│   │   └── lessons.ts               # Lesson content and vocabulary
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Navigation configuration
│   ├── screens/
│   │   ├── LanguageSelectionScreen.tsx  # Choose learning language
│   │   ├── HomeScreen.tsx               # Dashboard with progress
│   │   ├── LessonsScreen.tsx            # List of available lessons
│   │   ├── FlashcardScreen.tsx          # Interactive flashcard learning
│   │   ├── QuizScreen.tsx               # Quiz mode
│   │   ├── PeerLearningScreen.tsx       # Find and connect with peers
│   │   ├── PeerSessionScreen.tsx        # Collaborative learning session
│   │   └── ProfileScreen.tsx            # User profile and settings
│   ├── services/
│   │   └── PeerService.ts           # Peer-to-peer connection service
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   └── utils/
│       └── storage.ts               # AsyncStorage utility functions
├── package.json
├── tsconfig.json
├── babel.config.js
└── app.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd language-learning-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on specific platforms:
```bash
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on Web
```

## Usage

### Selecting a Language

When you first open the app, you'll be prompted to select a language you want to learn. Choose from 8 available languages.

### Learning with Flashcards

1. Navigate to the "Lessons" tab
2. Select a lesson based on difficulty level
3. Tap flashcards to flip between the foreign word and its translation
4. View pronunciation guides and example sentences
5. Progress through all cards to complete the lesson

### Taking Quizzes

1. Go to the "Home" tab
2. Tap "Practice Quiz" (available after completing at least one lesson)
3. Answer multiple-choice questions
4. Get immediate feedback on your answers
5. View your score at the end

### Tracking Progress

- View your statistics on the Home screen
- See completed lessons, mastered words, and total score
- Check detailed stats in your Profile

### Learning Together (Peer-to-Peer)

1. Navigate to the "Learn Together" tab
2. Browse available peers learning the same language
3. Connect with a peer by tapping "Connect"
4. Choose a lesson to study together
5. Use the chat feature to communicate during the session
6. Progress through flashcards together in sync
7. Complete the lesson and end the session when done

**Note**: The current implementation uses a simulated peer service for demonstration. In production, this can be easily upgraded to use a real Socket.io server for true peer-to-peer connections.

## Customization

### Adding New Languages

Edit `src/data/languages.ts`:

```typescript
{
  id: 'es',
  name: 'Spanish',
  nativeName: 'Español',
  flag: '🇪🇸',
}
```

### Adding New Lessons

Edit `src/data/lessons.ts`:

```typescript
{
  id: 'es-1',
  title: 'Basic Greetings',
  description: 'Learn essential Spanish greetings',
  languageId: 'es',
  difficulty: 'beginner',
  completed: false,
  vocabulary: [
    {
      id: 'es-1-1',
      word: 'Hola',
      translation: 'Hello',
      pronunciation: 'OH-lah',
      category: 'greetings',
      difficulty: 'beginner',
      example: 'Hola, ¿cómo estás?',
    },
    // Add more vocabulary items...
  ],
}
```

## Features in Detail

### State Management

The app uses React Context API for global state management:
- `selectedLanguage`: Currently selected learning language
- `userProgress`: User's progress for each language
- `userName`: User's display name

### Data Persistence

User data is stored locally using AsyncStorage:
- Selected language preference
- Progress for all languages
- User profile information

### Navigation Structure

- **Stack Navigator**: Main navigation container with native back button support
- **Tab Navigator**: Bottom tab navigation for main screens (Home, Lessons, Learn Together, Profile)
- **Stack Screens**: Flashcard, Quiz, and Peer Session screens with automatic back navigation
- **Header Styling**: Consistent blue header theme across all screens

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Peer-to-Peer Architecture

The app includes a complete peer-to-peer learning system:

**Current Implementation (Demo Mode)**:
- Simulated peer connections with mock users
- Real-time chat simulation
- Synchronized flashcard navigation
- Automatic peer responses

**Production Ready**:
The PeerService is architected to easily upgrade to a real backend:
1. Replace mock peer data with Socket.io server connections
2. Implement room-based sessions
3. Add WebRTC for video/audio calls
4. Deploy backend server for peer matching

**Server Requirements** (for production):
- Node.js backend with Socket.io
- Redis for session management
- WebSocket support
- HTTPS for secure connections

## Future Enhancements

- [ ] Audio pronunciation with native speakers
- [ ] Spaced repetition algorithm (SRS)
- [ ] Real Socket.io server for peer connections
- [ ] Video chat during peer sessions
- [ ] Group learning (3+ users)
- [ ] Leaderboards and competitions
- [ ] More languages and dialects
- [ ] Offline mode with sync
- [ ] Gamification (badges, achievements, streaks)
- [ ] Voice recognition for pronunciation practice
- [ ] Community-created content and lessons
- [ ] AI-powered conversation practice
