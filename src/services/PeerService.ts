import { PeerUser, ChatMessage, PeerSession, Lesson } from '../types';

// Mock peer service - In production, this would use Socket.io to connect to a real server
// For now, it simulates peer connections for demonstration purposes

class PeerService {
  private listeners: { [event: string]: Function[] } = {};
  private currentSession: PeerSession | null = null;
  private currentUser: PeerUser | null = null;

  // Simulate available peers
  private mockPeers: PeerUser[] = [
    {
      id: 'peer-1',
      name: 'Emma',
      languageId: 'es',
      score: 850,
      status: 'available',
    },
    {
      id: 'peer-2',
      name: 'Lucas',
      languageId: 'es',
      score: 1200,
      status: 'available',
    },
    {
      id: 'peer-3',
      name: 'Sophie',
      languageId: 'fr',
      score: 950,
      status: 'available',
    },
    {
      id: 'peer-4',
      name: 'Max',
      languageId: 'de',
      score: 780,
      status: 'available',
    },
  ];

  initialize(userId: string, userName: string, languageId: string, score: number) {
    this.currentUser = {
      id: userId,
      name: userName,
      languageId,
      score,
      status: 'available',
    };
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  findPeers(languageId: string): PeerUser[] {
    return this.mockPeers.filter(
      peer => peer.languageId === languageId && peer.status === 'available'
    );
  }

  async connectToPeer(peerId: string): Promise<PeerSession> {
    const peer = this.mockPeers.find(p => p.id === peerId);

    if (!peer || !this.currentUser) {
      throw new Error('Peer or current user not found');
    }

    // Create a new session
    this.currentSession = {
      id: `session-${Date.now()}`,
      users: [this.currentUser, peer],
      lesson: null,
      currentCardIndex: 0,
      messages: [],
      status: 'waiting',
    };

    // Mark peer as busy
    peer.status = 'busy';

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.emit('sessionCreated', this.currentSession);

    return this.currentSession;
  }

  startLesson(lesson: Lesson) {
    if (this.currentSession) {
      this.currentSession.lesson = lesson;
      this.currentSession.status = 'active';
      this.emit('lessonStarted', { lesson });
    }
  }

  nextCard() {
    if (this.currentSession && this.currentSession.lesson) {
      const maxIndex = this.currentSession.lesson.vocabulary.length - 1;
      if (this.currentSession.currentCardIndex < maxIndex) {
        this.currentSession.currentCardIndex++;
        this.emit('cardChanged', { index: this.currentSession.currentCardIndex });
      }
    }
  }

  previousCard() {
    if (this.currentSession && this.currentSession.currentCardIndex > 0) {
      this.currentSession.currentCardIndex--;
      this.emit('cardChanged', { index: this.currentSession.currentCardIndex });
    }
  }

  sendMessage(message: string) {
    if (this.currentSession && this.currentUser) {
      const chatMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        message,
        timestamp: new Date(),
      };

      this.currentSession.messages.push(chatMessage);
      this.emit('messageReceived', chatMessage);

      // Simulate peer response after a delay
      setTimeout(() => {
        this.simulatePeerResponse();
      }, 2000 + Math.random() * 3000);
    }
  }

  private simulatePeerResponse() {
    if (this.currentSession) {
      const peer = this.currentSession.users.find(u => u.id !== this.currentUser?.id);
      if (peer) {
        const responses = [
          "That's helpful!",
          "I didn't know that!",
          "Great explanation!",
          "Can you explain more?",
          "Let's move to the next one!",
          "This is interesting!",
          "Good job!",
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const chatMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: peer.id,
          senderName: peer.name,
          message: randomResponse,
          timestamp: new Date(),
        };

        this.currentSession.messages.push(chatMessage);
        this.emit('messageReceived', chatMessage);
      }
    }
  }

  getCurrentSession(): PeerSession | null {
    return this.currentSession;
  }

  endSession() {
    if (this.currentSession) {
      // Mark peer as available again
      const peer = this.currentSession.users.find(u => u.id !== this.currentUser?.id);
      if (peer) {
        const mockPeer = this.mockPeers.find(p => p.id === peer.id);
        if (mockPeer) {
          mockPeer.status = 'available';
        }
      }

      this.currentSession = null;
      this.emit('sessionEnded', {});
    }
  }

  disconnect() {
    this.endSession();
    this.listeners = {};
    this.currentUser = null;
  }
}

export default new PeerService();
