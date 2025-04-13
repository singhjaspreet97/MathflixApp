import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuScreen = ({ navigation }) => {
  const [allowedTime, setAllowedTime] = useState('Loading...');

  useEffect(() => {
    const fetchAllowedTime = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        const response = await fetch(`https://6934-173-32-216-255.ngrok-free.app/api/user/${username}/screen-time`);
        const data = await response.json();

        if (response.ok) {
          setAllowedTime(data.allowedTime !== undefined ? `${data.allowedTime} minutes` : 'N/A');
        } else {
          setAllowedTime('N/A');
        }
      } catch (error) {
        console.error('Fetch screen time error:', error);
        setAllowedTime('N/A');
      }
    };

    fetchAllowedTime();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'You have been logged out.', [
      { text: 'OK', onPress: () => navigation.replace('Login') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Mathflix Menu</Text>
      <Text style={styles.subText}>Screen Time: {allowedTime}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('WebView')}
      >
        <Text style={styles.buttonText}>Open Quiz Portal</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SelectApps')}
      >
        <Text style={styles.buttonText}>Select Apps to Block</Text>
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
