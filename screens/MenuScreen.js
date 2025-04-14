import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuScreen = ({ navigation }) => {
  const [allowedTime, setAllowedTime] = useState('Loading...');
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = await AsyncStorage.getItem('username');

        // Fetch allowedTime
        const response = await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/user/${username}/screen-time`);
        const data = await response.json();
        setAllowedTime(response.ok && data.allowedTime !== undefined ? `${data.allowedTime} minutes` : 'N/A');

        // Fetch active session
        const sessionData = await AsyncStorage.getItem(`activeSession_${username}`);
        if (sessionData) {
          setActiveSession(JSON.parse(sessionData));
        } else {
          setActiveSession(null);
        }

      } catch (error) {
        console.error('Error:', error);
        setAllowedTime('N/A');
        setActiveSession(null);
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchData);
    fetchData();

    return unsubscribe;
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert('Logout', 'You have been logged out.', [
      { text: 'OK', onPress: () => navigation.replace('Login') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Mathflix Menu</Text>
      <Text style={styles.subText}>Screen Time: {allowedTime}</Text>

      {activeSession && (
        <TouchableOpacity
          style={styles.sessionCard}
          onPress={() => navigation.navigate('EndSession', { session: activeSession })}
        >
          <Text style={styles.sessionTitle}>Active Session</Text>
          <Text style={styles.sessionSubtitle}>Blocklist: {activeSession.blocklistName}</Text>
          <Text style={styles.sessionSubtitle}>Device: {activeSession.device}</Text>
          <Text style={styles.sessionSubtitle}>Ends: {new Date(activeSession.end).toLocaleString()}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('StartSession')}
      >
        <Text style={styles.buttonText}>Select Session</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('WebView')}
      >
        <Text style={styles.buttonText}>Open Quiz Portal</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 30,
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: '#2e2e2e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00d4ff',
    marginBottom: 6
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 2
  },
  button: {
    backgroundColor: '#8b5cf6',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginVertical: 10
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 40
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center'
  }
});

export default MenuScreen;
