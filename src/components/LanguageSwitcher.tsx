import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LANGUAGES } from '../data/languages';
import { Language } from '../types';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

interface LanguageSwitcherProps {
  visible: boolean;
  onClose: () => void;
  currentLanguage: Language | null;
  onSelectLanguage: (language: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  visible,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) => {
  const handleSelect = (language: Language) => {
    onSelectLanguage(language);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <LinearGradient
            colors={Colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Switch Language</Text>
            <Text style={styles.headerSubtitle}>Choose a language to learn</Text>
          </LinearGradient>

          {/* Language List */}
          <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
            {LANGUAGES.map((language) => {
              const isSelected = currentLanguage?.id === language.id;

              return (
                <TouchableOpacity
                  key={language.id}
                  style={[
                    styles.languageItem,
                    isSelected && styles.languageItemSelected,
                  ]}
                  onPress={() => handleSelect(language)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageFlag}>{language.flag}</Text>
                    <View style={styles.languageText}>
                      <Text style={styles.languageName}>{language.name}</Text>
                      <Text style={styles.languageNative}>{language.nativeName}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkIcon}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
    ...Shadows.lg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.weights.medium,
  },
  languageList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  languageItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F4FF',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 48,
    marginRight: Spacing.md,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  languageNative: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    fontSize: 18,
    color: Colors.text.inverse,
    fontWeight: Typography.weights.bold,
  },
  closeButton: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  closeButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
  },
});

export default LanguageSwitcher;
