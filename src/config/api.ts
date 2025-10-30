// API Configuration
// In production, replace these with your actual backend URLs

export const API_CONFIG = {
  // Backend API base URL
  BASE_URL: process.env.API_BASE_URL || 'https://api.languagelearning.app',

  // Socket.io server URL for peer-to-peer connections
  SOCKET_URL: process.env.SOCKET_URL || 'https://socket.languagelearning.app',

  // API endpoints
  ENDPOINTS: {
    // User endpoints
    USER_REGISTER: '/api/users/register',
    USER_LOGIN: '/api/users/login',
    USER_PROFILE: '/api/users/profile',
    USER_PROGRESS: '/api/users/progress',

    // Progress sync
    SYNC_PROGRESS: '/api/sync/progress',
    GET_PROGRESS: '/api/sync/progress/:userId',

    // Leaderboard
    LEADERBOARD: '/api/leaderboard',

    // Peer learning
    FIND_PEERS: '/api/peers/find',
    PEER_STATUS: '/api/peers/status',
  },

  // Timeouts
  TIMEOUT: 10000, // 10 seconds

  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Feature flags for online/offline modes
export const FEATURES = {
  ENABLE_CLOUD_SYNC: true,
  ENABLE_REAL_PEER_CONNECTIONS: false, // Set to true when backend is ready
  ENABLE_LEADERBOARD: false,
  OFFLINE_MODE: true,
};

// Demo mode - uses mock data when backend is not available
export const DEMO_MODE = !FEATURES.ENABLE_REAL_PEER_CONNECTIONS;
