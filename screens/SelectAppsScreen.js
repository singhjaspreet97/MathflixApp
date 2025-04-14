import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const dummyApps = [
  { id: '1', name: 'YouTube' },
  { id: '2', name: 'Instagram' },
  { id: '3', name: 'Snapchat' },
  { id: '4', name: 'Facebook' },
  { id: '5', name: 'TikTok' }
];

export default function SelectAppsScreen({ route, navigation }) {
  const { blocklistName: incomingName } = route.params || {};
  const [blocklistName, setBlocklistName] = useState(incomingName || '');
  const [selectedApps, setSelectedApps] = useState([]);

  useEffect(() => {
    if (incomingName) {
      loadBlocklist(incomingName);
    }
  }, [incomingName]);

  const loadBlocklist = async (name) => {
    try {
      const data = await AsyncStorage.getItem(`blocklist_${name}`);
      if (data) {
        const parsed = JSON.parse(data);
        setSelectedApps(parsed.apps || []);
      }
    } catch (error) {
      console.error('Failed to load blocklist:', error);
    }
  };

  const toggleAppSelection = (appId) => {
    setSelectedApps(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const saveBlocklist = async () => {
    if (!blocklistName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your blocklist.');
      return;
    }

    try {
      const username = await AsyncStorage.getItem('username');
      const response = await fetch('https://innocent-adversely-meerkat.ngrok-free.app/api/blocklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name: blocklistName, apps: selectedApps })
      });

      if (response.ok) {
        Alert.alert('Success', 'Blocklist saved successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save blocklist.');
    }
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
      <Text style={styles.title}>{incomingName ? 'Edit Blocklist' : 'Create Blocklist'}</Text>
      {!incomingName && (
        <TextInput
          placeholder="Blocklist Name"
          placeholderTextColor="#888"
          style={styles.input}
          value={blocklistName}
          onChangeText={setBlocklistName}
        />
      )}

      <FlatList
        data={dummyApps}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveBlocklist}>
        <Text style={styles.buttonText}>Save Blocklist</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 20 },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20
  },
  list: { paddingBottom: 20 },
  appItem: {
    backgroundColor: '#2e2e2e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  selected: { backgroundColor: '#8b5cf6' },
  appName: { color: '#fff', fontSize: 18 },
  saveButton: {
    backgroundColor: '#00d4ff',
    padding: 15,
    borderRadius: 10,
    marginTop: 20
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
