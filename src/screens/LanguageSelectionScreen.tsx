import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../data/languages';
import { Language } from '../types';

const LanguageSelectionScreen = () => {
  const { setSelectedLanguage } = useApp();

  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={styles.languageCard}
      onPress={() => handleSelectLanguage(item)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <View style={styles.languageInfo}>
        <Text style={styles.languageName}>{item.name}</Text>
        <Text style={styles.nativeName}>{item.nativeName}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a Language</Text>
        <Text style={styles.subtitle}>Select the language you want to learn</Text>
      </View>
      <FlatList
        data={LANGUAGES}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
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
  list: {
    padding: 20,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  flag: {
    fontSize: 40,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  arrow: {
    fontSize: 24,
    color: '#BDC3C7',
  },
});

export default LanguageSelectionScreen;
