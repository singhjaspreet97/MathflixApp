import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  Alert,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const StartSessionScreen = ({ navigation }) => {
  const [sessions, setSessions] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [renameModal, setRenameModal] = useState(false);
  const [copyModal, setCopyModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadSessions);
    loadSessions();
    return unsubscribe;
  }, [navigation]);

  const loadSessions = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const response = await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/blocklists/${username}`);
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  const deleteSession = async (name) => {
    const username = await AsyncStorage.getItem('username');
    await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/blocklists/${username}/${name}`, {
      method: 'DELETE'
    });
    setActiveMenu(null);
    loadSessions();
  };

  const renameSession = async () => {
    const oldName = selectedSession.name;
    const newName = inputValue.trim();
    if (!newName || oldName === newName) return;

    try {
      const username = await AsyncStorage.getItem('username');

      // 1. Get the existing blocklist by old name
      const response = await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/blocklists/${username}`);
      const allBlocklists = await response.json();
      const oldBlocklist = allBlocklists.find(b => b.name === oldName);

      if (!oldBlocklist) {
        Alert.alert('Error', 'Blocklist not found');
        return;
      }

      // 2. Create a new blocklist with the new name and same apps
      await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/blocklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          name: newName,
          apps: oldBlocklist.apps
        })
      });

      // 3. Delete the old blocklist
      await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/blocklists/${username}/${oldName}`, {
        method: 'DELETE'
      });

      setRenameModal(false);
      setActiveMenu(null);
      loadSessions();
    } catch (err) {
      console.error('Rename session error:', err);
      Alert.alert('Error', 'Failed to rename session');
    }
  };

  const copySession = async () => {
    const newName = inputValue.trim();
    if (!newName) return;

    try {
      const username = await AsyncStorage.getItem('username');
      
      // Fetch original blocklist from MongoDB
      const response = await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/blocklists/${username}`);
      const blocklists = await response.json();
      
      const original = blocklists.find(b => b.name === selectedSession.name);
      if (!original) {
        Alert.alert('Error', 'Original blocklist not found');
        return;
      }

      // Create the new copied blocklist
      await fetch('https://innocent-adversely-meerkat.ngrok-free.app/api/blocklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          name: newName,
          apps: original.apps
        })
      });

      setCopyModal(false);
      setActiveMenu(null);
      loadSessions();
    } catch (err) {
      console.error('Copy session error:', err);
      Alert.alert('Error', 'Failed to copy session');
    }
  };

  const renderSession = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('SessionDetails', { blocklistName: item.name })}
      style={styles.sessionCard}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={styles.sessionTitle}>{item.name}</Text>
          <Text style={styles.sessionSubtitle}>Apps Blocked: {item.apps.length}</Text>
        </View>
        <TouchableOpacity onPress={() => setActiveMenu(item.name)}>
          <MaterialIcons name="more-vert" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {activeMenu === item.name && (
        <TouchableWithoutFeedback onPress={() => setActiveMenu(null)}>
          <View style={styles.menuOverlay}>
            <View style={styles.menu}>
              <TouchableOpacity onPress={() => {
                setActiveMenu(null);
                navigation.navigate('SelectApps', { blocklistName: item.name });
              }}>
                <Text style={styles.menuItem}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setSelectedSession(item);
                setInputValue(item.name);
                setRenameModal(true);
              }}>
                <Text style={styles.menuItem}>Rename</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setSelectedSession(item);
                setInputValue(`Copy of ${item.name}`);
                setCopyModal(true);
              }}>
                <Text style={styles.menuItem}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteSession(item.name)}>
                <Text style={[styles.menuItem, { color: 'red' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={() => setActiveMenu(null)}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Your Focus Sessions</Text>

        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>No sessions available.</Text>
        ) : (
          <FlatList
            data={sessions}
            renderItem={renderSession}
            keyExtractor={(item, index) => `${item.name}_${index}`}
            contentContainerStyle={styles.list}
          />
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('SelectApps')}
        >
          <Text style={styles.createButtonText}>+ Create New Session</Text>
        </TouchableOpacity>

        {/* Rename Modal */}
        <Modal visible={renameModal} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rename blocklist {selectedSession?.name}</Text>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="New name"
                placeholderTextColor="#888"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setRenameModal(false)}>
                  <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={renameSession}>
                  <Text style={styles.save}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Copy Modal */}
        <Modal visible={copyModal} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Copy blocklist "{selectedSession?.name}" with new name</Text>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Copy name"
                placeholderTextColor="#888"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setCopyModal(false)}>
                  <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={copySession}>
                  <Text style={styles.save}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 20 },
  heading: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  emptyText: { color: '#aaa', fontSize: 16, textAlign: 'center', marginTop: 40 },
  list: { paddingBottom: 80 },
  sessionCard: { backgroundColor: '#2e2e2e', padding: 15, borderRadius: 10, marginBottom: 15 },
  sessionTitle: { fontSize: 18, color: '#8b5cf6', fontWeight: 'bold' },
  sessionSubtitle: { fontSize: 14, color: '#ccc', marginTop: 4 },
  createButton: {
    backgroundColor: '#00d4ff',
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  menuOverlay: {
    position: 'absolute',
    right: 0,
    top: 45,
    backgroundColor: '#2e2e2e',
    borderRadius: 10,
    padding: 10,
    zIndex: 10,
    elevation: 5,
  },
  menu: {
    minWidth: 120,
  },
  menuItem: {
    color: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2e2e2e',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#444',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cancel: {
    color: '#aaa',
    fontSize: 16
  },
  save: {
    color: '#00d4ff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default StartSessionScreen;
