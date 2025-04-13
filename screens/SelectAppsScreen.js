import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const dummyApps = [
  { id: '1', name: 'YouTube' },
  { id: '2', name: 'Instagram' },
  { id: '3', name: 'Snapchat' },
  { id: '4', name: 'Facebook' },
  { id: '5', name: 'TikTok' }
];

const SelectAppsScreen = () => {
  const [selectedApps, setSelectedApps] = useState([]);

  const toggleAppSelection = (appId) => {
    setSelectedApps(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedApps.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.appItem, isSelected && styles.selected]}
        onPress={() => toggleAppSelection(item.id)}
      >
        <Text style={styles.appName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Apps to Block</Text>
      <FlatList
        data={dummyApps}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  list: {
    paddingBottom: 20
  },
  appItem: {
    backgroundColor: '#2e2e2e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  selected: {
    backgroundColor: '#8b5cf6',
  },
  appName: {
    color: '#fff',
    fontSize: 18
  }
});

export default SelectAppsScreen;
