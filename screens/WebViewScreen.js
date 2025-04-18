import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

const WebViewScreen = () => {
  const route = useRoute();

  // 👇 Default URL
  const defaultUrl = 'https://mathflix.from-ca.com/';
  const url = route.params?.url || defaultUrl;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator size="large" color="#00d4ff" style={{ marginTop: 100 }} />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default WebViewScreen;
