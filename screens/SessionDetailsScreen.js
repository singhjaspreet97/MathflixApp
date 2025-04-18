import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SessionDetailsScreen({ route, navigation }) {
  const { blocklistName } = route.params;

  const [allowedTime, setAllowedTime] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [showStartPicker, setShowStartPicker] = useState({ show: false, mode: 'date' });
  const [showEndPicker, setShowEndPicker] = useState({ show: false, mode: 'date' });

  const deviceName = 'Pixel 9';

  useEffect(() => {
    const fetchAllowedTime = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        const res = await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/user/${username}/screen-time`);
        const data = await res.json();
        setAllowedTime(data.allowedTime || 'N/A');
      } catch (err) {
        console.error('Failed to fetch allowedTime:', err);
        setAllowedTime('N/A');
      } finally {
        setLoading(false);
      }
    };

    fetchAllowedTime();
  }, []);

  const handleDateChange = (mode, isStart, event, selectedDate) => {
    if (event.type === 'dismissed') {
      isStart ? setShowStartPicker({ show: false, mode: 'date' }) : setShowEndPicker({ show: false, mode: 'date' });
      return;
    }

    const currentDate = selectedDate || (isStart ? startDate : endDate);
    if (mode === 'date') {
      const updatedDate = new Date(currentDate);
      const time = isStart ? startDate : endDate;
      updatedDate.setHours(time.getHours(), time.getMinutes());
      isStart ? setStartDate(updatedDate) : setEndDate(updatedDate);
      isStart ? setShowStartPicker({ show: true, mode: 'time' }) : setShowEndPicker({ show: true, mode: 'time' });
    } else {
      const updatedDate = new Date(isStart ? startDate : endDate);
      updatedDate.setHours(currentDate.getHours(), currentDate.getMinutes());
      isStart ? setStartDate(updatedDate) : setEndDate(updatedDate);
      isStart ? setShowStartPicker({ show: false, mode: 'date' }) : setShowEndPicker({ show: false, mode: 'date' });
    }
  };

  const handleStartSession = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const sessionInfo = {
        username,
        blocklistName,
        device: deviceName,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allowedTime
      };

      const response = await fetch('https://innocent-adversely-meerkat.ngrok-free.app/api/active-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionInfo)
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      Alert.alert('Session Started!', 'Your focus session is now active.', [
        { text: 'OK', onPress: () => navigation.navigate('MockMenu') }
      ]);
    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', 'Could not start the session.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Start Session</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#00d4ff" />
      ) : (
        <View style={styles.infoContainer}>
          <View style={styles.row}><Text style={styles.label}>Blocklists</Text><Text style={styles.value}>{blocklistName}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Devices</Text><Text style={styles.value}>{deviceName}</Text></View>

          <View style={styles.row}>
            <Text style={styles.label}>Starts</Text>
            <TouchableOpacity onPress={() => setShowStartPicker({ show: true, mode: 'date' })}>
              <Text style={styles.value}>{startDate.toLocaleString()}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Ends</Text>
            <TouchableOpacity onPress={() => setShowEndPicker({ show: true, mode: 'date' })}>
              <Text style={styles.value}>{endDate.toLocaleString()}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>{allowedTime} mins</Text>
          </View>
        </View>
      )}

      {showStartPicker.show && (
        <DateTimePicker
          value={startDate}
          mode={showStartPicker.mode}
          display="default"
          onChange={(e, date) => handleDateChange(showStartPicker.mode, true, e, date)}
        />
      )}

      {showEndPicker.show && (
        <DateTimePicker
          value={endDate}
          mode={showEndPicker.mode}
          display="default"
          onChange={(e, date) => handleDateChange(showEndPicker.mode, false, e, date)}
        />
      )}

      <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
        <Text style={styles.startButtonText}>START SESSION</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 20 },
  heading: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 20 },
  infoContainer: { backgroundColor: '#2e2e2e', borderRadius: 10, padding: 20, marginBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  label: { color: '#ccc', fontSize: 16 },
  value: { color: '#00d4ff', fontSize: 16 },
  startButton: { backgroundColor: '#63dc74', padding: 15, borderRadius: 10, alignItems: 'center' },
  startButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});
