import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EndSessionScreen({ route, navigation }) {
  const { session } = route.params;
  const handleEndSession = async () => {
    try {
      const username = await AsyncStorage.getItem('username');

      await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/active-session/${username}`, {
        method: 'DELETE',
      });

      Alert.alert('Session Ended', 'The session has been successfully ended.', [
        { text: 'OK', onPress: () => navigation.navigate('MockMenu') }
      ]);
      navigation.navigate('MockMenu', { refresh: true });
    } catch (error) {
      console.error('Failed to end session:', error);
      Alert.alert('Error', 'Could not end the session.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Active Session Details</Text>

      <View style={styles.sessionCard}>
        <Text style={styles.label}>Blocklist: <Text style={styles.value}>{session.blocklistName}</Text></Text>
        <Text style={styles.label}>Device: <Text style={styles.value}>{session.device}</Text></Text>
        <Text style={styles.label}>Start Time: <Text style={styles.value}>{new Date(session.start).toLocaleString()}</Text></Text>
        <Text style={styles.label}>End Time: <Text style={styles.value}>{new Date(session.end).toLocaleString()}</Text></Text>
        <Text style={styles.label}>Allowed Time: <Text style={styles.value}>{session.allowedTime} mins</Text></Text>
      </View>

      <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
        <Text style={styles.endButtonText}>End Session</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 20 },
  heading: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sessionCard: { backgroundColor: '#2e2e2e', borderRadius: 10, padding: 20, marginBottom: 30 },
  label: { color: '#ccc', fontSize: 16, marginBottom: 10 },
  value: { color: '#00d4ff' },
  endButton: { backgroundColor: '#ff4d4d', padding: 15, borderRadius: 10, alignItems: 'center' },
  endButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
