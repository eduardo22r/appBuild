import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkListener = (isConnected: boolean) => void;

class NetworkService {
  private listeners: NetworkListener[] = [];
  private isConnected: boolean = true;
  private unsubscribe: (() => void) | null = null;

  initialize() {
    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;

      if (this.isConnected !== connected) {
        this.isConnected = connected;
        this.notifyListeners(connected);
      }
    });

    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      this.isConnected = state.isConnected ?? false;
      this.notifyListeners(this.isConnected);
    });
  }

  addListener(listener: NetworkListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: NetworkListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(isConnected: boolean) {
    this.listeners.forEach(listener => listener(isConnected));
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async checkConnection(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners = [];
  }
}

export default new NetworkService();
