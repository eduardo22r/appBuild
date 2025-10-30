import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors, Spacing, Typography } from '../theme';

const ConnectionStatusBar: React.FC = () => {
  const { isOnline, isSyncing, lastSyncTime } = useApp();
  const [slideAnim] = useState(new Animated.Value(-60));
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (!isOnline || isSyncing) {
      setShowStatus(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      // Hide after a delay when back online
      const timeout = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowStatus(false);
        });
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isOnline, isSyncing]);

  if (!showStatus && isOnline && !isSyncing) {
    return null;
  }

  const getStatusConfig = () => {
    if (isSyncing) {
      return {
        backgroundColor: Colors.info,
        icon: '🔄',
        text: 'Syncing...',
      };
    }

    if (!isOnline) {
      return {
        backgroundColor: Colors.warning,
        icon: '📡',
        text: 'Offline - Changes will sync when reconnected',
      };
    }

    return {
      backgroundColor: Colors.success,
      icon: '✓',
      text: 'Back online!',
    };
  };

  const status = getStatusConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: status.backgroundColor, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.icon}>{status.icon}</Text>
      <Text style={styles.text}>{status.text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50, // Account for status bar
    paddingBottom: 12,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  text: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});

export default ConnectionStatusBar;
