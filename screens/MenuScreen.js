import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef } from 'react';

const MenuScreen = ({ navigation }) => {
  const [allowedTime, setAllowedTime] = useState('Loading...');
  const [activeSession, setActiveSession] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [streamTimeLeft, setStreamTimeLeft] = useState(null);
  const streamInterval = useRef(null);
  const [shouldLaunchQuiz, setShouldLaunchQuiz] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        const token = await AsyncStorage.getItem('token');

        // Fetch session first
        const sessionResponse = await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/active-session/${username}`, {
          headers: { Authorization: token }
        });
        const session = await sessionResponse.json();

        if (session && new Date(session.end) < new Date()) {
          await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/active-session/${username}`, {
            method: 'DELETE',
          });
          setActiveSession(null);
          await AsyncStorage.removeItem('streamingStartTime');
        } else {
          setActiveSession(session);
        }

        // Fetch allowedTime
        const response = await fetch(`https://innocent-adversely-meerkat.ngrok-free.app/api/user/${username}/screen-time`);
        const data = await response.json();

        if (response.ok && data.allowedTime !== undefined) {
          setAllowedTime(`${data.allowedTime} minutes`);

          const total = data.allowedTime * 60 * 1000;
          let remaining = total;

          const storedStart = await AsyncStorage.getItem('streamingStartTime');
          if (storedStart) {
            const elapsed = Date.now() - parseInt(storedStart);
            remaining = total - elapsed;
          } else {
            await AsyncStorage.setItem('streamingStartTime', Date.now().toString());
          }

          if (remaining <= 0) {
            setStreamTimeLeft(0);
            setShouldLaunchQuiz(true);
          } else {
            setStreamTimeLeft(remaining);

            if (streamInterval.current) clearInterval(streamInterval.current);
            streamInterval.current = setInterval(() => {
              setStreamTimeLeft(prev => {
                if (prev <= 1000) {
                  clearInterval(streamInterval.current);
                  setShouldLaunchQuiz(true);
                  return 0;
                }
                return prev - 1000;
              });
            }, 1000);
          }
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

  // 🆕 Countdown updater
  useEffect(() => {
    let interval;

    if (activeSession) {
      const updateCountdown = () => {
        const now = new Date();
        const end = new Date(activeSession.end);
        const diff = end - now;

        if (diff <= 0) {
          setCountdown('Session ended');
          clearInterval(interval);
          setActiveSession(null);
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      };

      updateCountdown();
      interval = setInterval(updateCountdown, 1000);
    }

    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    const launchQuiz = async () => {
      if (shouldLaunchQuiz && activeSession) {
        const username = await AsyncStorage.getItem('username');
        await AsyncStorage.removeItem('streamingStartTime');
        setActiveSession(null);
        setShouldLaunchQuiz(false);
        navigation.navigate("WebView", {
          // url: `https://mathflix.from-ca.com/generate-token/${username}`
          url: `http://10.0.0.192:3000/generate-token/${username}`
        });
        setShouldLaunchQuiz(false); // reset flag
      }
    };

    launchQuiz();
  }, [shouldLaunchQuiz]);

  useEffect(() => {
    if (!activeSession || allowedTime === 'N/A' || allowedTime === 'Loading...') return;

    const minutesMatch = allowedTime.match(/^(\d+)\s+minutes$/);
    if (!minutesMatch) return;

    const allowedMinutes = parseInt(minutesMatch[1]);
    const newTime = allowedMinutes * 60 * 1000;
    setStreamTimeLeft(newTime);

    // 🧼 Clear previous interval
    if (streamInterval.current) clearInterval(streamInterval.current);

    // ✅ Start fresh interval
    streamInterval.current = setInterval(() => {
      setStreamTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(streamInterval.current);
          setShouldLaunchQuiz(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    // 🧼 Cleanup on unmount
    return () => clearInterval(streamInterval.current);
  }, [allowedTime]);

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
          <Text style={styles.sessionSubtitle}>⏳ Time Left: {countdown}</Text>
          <Text style={styles.sessionSubtitle}>
            🎯 Streaming Time Left: {
              streamTimeLeft !== null
                ? `${Math.floor(streamTimeLeft / 60000)}m ${Math.floor((streamTimeLeft % 60000) / 1000)}s`
                : 'Calculating...'
            }
          </Text>
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