import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { PeerUser } from '../types';
import PeerService from '../services/PeerService';

const PeerLearningScreen = ({ navigation }: any) => {
  const { selectedLanguage, userName, userProgress } = useApp();
  const [peers, setPeers] = useState<PeerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (selectedLanguage) {
      // Initialize peer service
      const currentProgress = userProgress.find(p => p.languageId === selectedLanguage.id);
      const score = currentProgress?.score || 0;

      PeerService.initialize(
        `user-${Date.now()}`,
        userName,
        selectedLanguage.id,
        score
      );

      loadPeers();
    }

    return () => {
      // Cleanup if needed
    };
  }, [selectedLanguage]);

  const loadPeers = () => {
    if (selectedLanguage) {
      setLoading(true);
      // Simulate loading delay
      setTimeout(() => {
        const availablePeers = PeerService.findPeers(selectedLanguage.id);
        setPeers(availablePeers);
        setLoading(false);
      }, 800);
    }
  };

  const handleConnectToPeer = async (peer: PeerUser) => {
    setConnecting(peer.id);

    try {
      const session = await PeerService.connectToPeer(peer.id);

      Alert.alert(
        'Connected!',
        `You're now connected with ${peer.name}. Choose a lesson to start learning together!`,
        [
          {
            text: 'Start Session',
            onPress: () => {
              navigation.navigate('PeerSession', { session });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to peer. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  const renderPeerItem = ({ item }: { item: PeerUser }) => (
    <TouchableOpacity
      style={styles.peerCard}
      onPress={() => handleConnectToPeer(item)}
      disabled={connecting !== null}
    >
      <View style={styles.peerHeader}>
        <View style={styles.peerAvatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.peerInfo}>
          <Text style={styles.peerName}>{item.name}</Text>
          <Text style={styles.peerScore}>{item.score} points</Text>
        </View>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.status === 'available' ? '#27AE60' : '#E74C3C' },
          ]}
        />
      </View>

      {connecting === item.id ? (
        <ActivityIndicator size="small" color="#4A90E2" style={styles.connectingIndicator} />
      ) : (
        <View style={styles.connectButton}>
          <Text style={styles.connectButtonText}>Connect</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No peers available</Text>
      <Text style={styles.emptyText}>
        Check back later or invite friends to learn together!
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={loadPeers}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learn Together</Text>
        <Text style={styles.subtitle}>
          Find peers learning {selectedLanguage?.name}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Connect with other learners to practice together, share flashcards, and motivate
          each other!
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Finding peers...</Text>
        </View>
      ) : (
        <FlatList
          data={peers}
          renderItem={renderPeerItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyState}
          refreshing={loading}
          onRefresh={loadPeers}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  list: {
    padding: 20,
  },
  peerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  peerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  peerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  peerInfo: {
    flex: 1,
  },
  peerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  peerScore: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  connectingIndicator: {
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PeerLearningScreen;
