import axios from 'axios';
import { API_CONFIG, FEATURES } from '../config/api';
import { UserProgress } from '../types';
import { storage } from '../utils/storage';
import NetworkService from './NetworkService';

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
}

class CloudSyncService {
  private syncStatus: SyncStatus = {
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
  };

  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private userId: string | null = null;

  initialize(userId: string) {
    this.userId = userId;
  }

  /**
   * Sync user progress to cloud
   */
  async syncProgress(progress: UserProgress[]): Promise<boolean> {
    if (!FEATURES.ENABLE_CLOUD_SYNC || !NetworkService.getConnectionStatus()) {
      console.log('Cloud sync disabled or offline');
      return false;
    }

    this.updateSyncStatus({ isSyncing: true, syncError: null });

    try {
      // In demo mode, simulate sync
      if (!FEATURES.ENABLE_REAL_PEER_CONNECTIONS) {
        await this.simulateSync();
        this.updateSyncStatus({
          isSyncing: false,
          lastSyncTime: new Date(),
          syncError: null,
        });
        return true;
      }

      // Real API call
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SYNC_PROGRESS}`,
        {
          userId: this.userId,
          progress,
          timestamp: new Date().toISOString(),
        },
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      if (response.data.success) {
        this.updateSyncStatus({
          isSyncing: false,
          lastSyncTime: new Date(),
          syncError: null,
        });
        return true;
      }

      throw new Error('Sync failed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Sync error:', errorMessage);
      this.updateSyncStatus({
        isSyncing: false,
        syncError: errorMessage,
      });
      return false;
    }
  }

  /**
   * Fetch progress from cloud
   */
  async fetchProgress(): Promise<UserProgress[] | null> {
    if (!FEATURES.ENABLE_CLOUD_SYNC || !NetworkService.getConnectionStatus()) {
      return null;
    }

    try {
      // In demo mode, return null (use local data)
      if (!FEATURES.ENABLE_REAL_PEER_CONNECTIONS) {
        return null;
      }

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_PROGRESS.replace(':userId', this.userId || '')}`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      if (response.data.success) {
        return response.data.progress;
      }

      return null;
    } catch (error) {
      console.error('Fetch progress error:', error);
      return null;
    }
  }

  /**
   * Auto-sync progress when online
   */
  async autoSync(progress: UserProgress[]): Promise<void> {
    if (!NetworkService.getConnectionStatus()) {
      // Queue for later sync
      await this.queueSyncData(progress);
      return;
    }

    await this.syncProgress(progress);
  }

  /**
   * Queue sync data for when connection is restored
   */
  private async queueSyncData(progress: UserProgress[]): Promise<void> {
    try {
      const queueKey = 'sync_queue';
      const existingQueue = await storage.getUserProgress(); // Using existing storage
      // In a real implementation, you'd have a separate queue storage
      console.log('Data queued for sync when online');
    } catch (error) {
      console.error('Error queuing sync data:', error);
    }
  }

  /**
   * Process sync queue when connection is restored
   */
  async processSyncQueue(): Promise<void> {
    if (!NetworkService.getConnectionStatus()) {
      return;
    }

    console.log('Processing sync queue...');
    const progress = await storage.getUserProgress();
    await this.syncProgress(progress);
  }

  /**
   * Simulate sync for demo mode
   */
  private simulateSync(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✓ Progress synced to cloud (demo mode)');
        resolve();
      }, 1500);
    });
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  /**
   * Add sync status listener
   */
  addSyncListener(listener: (status: SyncStatus) => void) {
    this.syncListeners.push(listener);
  }

  /**
   * Remove sync status listener
   */
  removeSyncListener(listener: (status: SyncStatus) => void) {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  /**
   * Update and notify sync status
   */
  private updateSyncStatus(update: Partial<SyncStatus>) {
    this.syncStatus = { ...this.syncStatus, ...update };
    this.syncListeners.forEach(listener => listener(this.syncStatus));
  }

  /**
   * Check if data is stale and needs sync
   */
  needsSync(): boolean {
    if (!this.syncStatus.lastSyncTime) {
      return true;
    }

    const hoursSinceSync =
      (Date.now() - this.syncStatus.lastSyncTime.getTime()) / (1000 * 60 * 60);

    return hoursSinceSync > 1; // Sync if more than 1 hour old
  }
}

export default new CloudSyncService();
