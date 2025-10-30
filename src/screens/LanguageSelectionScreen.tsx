import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../data/languages';
import { Language } from '../types';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

const LanguageSelectionScreen = () => {
  const { setSelectedLanguage } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectLanguage = (language: Language) => {
    setSelectedId(language.id);
    setTimeout(() => {
      setSelectedLanguage(language);
    }, 300);
  };

  const renderLanguageItem = ({ item, index }: { item: Language; index: number }) => {
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        style={[styles.languageCard, isSelected && styles.selectedCard]}
        onPress={() => handleSelectLanguage(item)}
        activeOpacity={0.7}
      >
        {isSelected && (
          <LinearGradient
            colors={Colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        <View style={styles.cardContent}>
          <View style={styles.flagContainer}>
            <Text style={styles.flag}>{item.flag}</Text>
          </View>
          <View style={styles.languageInfo}>
            <Text style={[styles.languageName, isSelected && styles.selectedText]}>
              {item.name}
            </Text>
            <Text style={[styles.nativeName, isSelected && styles.selectedNativeText]}>
              {item.nativeName}
            </Text>
          </View>
          <View style={[styles.checkCircle, isSelected && styles.checkedCircle]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={Colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🌍</Text>
          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.subtitle}>Select the language you want to master</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <FlatList
          data={LANGUAGES}
          renderItem={renderLanguageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  content: {
    flex: 1,
  },
  list: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  languageCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  selectedCard: {
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  flagContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  flag: {
    fontSize: 32,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  nativeName: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  selectedText: {
    color: Colors.text.inverse,
  },
  selectedNativeText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: Colors.text.inverse,
  },
  checkmark: {
    fontSize: 18,
    color: Colors.text.inverse,
    fontWeight: Typography.weights.bold,
  },
});

export default LanguageSelectionScreen;
