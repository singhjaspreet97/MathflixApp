import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    try {
      const response = await fetch('https://innocent-adversely-meerkat.ngrok-free.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      console.log("Login API response:", data);

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('username', data.username);
        Alert.alert('Login successful', `Welcome, ${data.username}`);
        navigation.replace('MockMenu');
      } else {
        console.warn('Token missing in response:', data);
        Alert.alert('Login Failed', data.message || 'Try again');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please check your internet or server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to Mathflix</Text>
      <TextInput
        placeholder="Username"
        placeholderTextColor="#888"
        style={styles.input}
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
        value={password}
      />
      <Button title="Login" onPress={handleLogin} color="#00d4ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#00d4ff',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
});
