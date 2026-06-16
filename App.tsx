// GeoProof — App Entry Point
// Handles font loading, DB migrations, and renders the navigator

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useDatabaseMigrations } from './src/db/migrations';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/theme';
import { ensurePhotoDirectory, ensureReportsDirectory } from './src/utils/fileStorage';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { success: dbReady, error: dbError } = useDatabaseMigrations();
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    async function initStorage() {
      try {
        await ensurePhotoDirectory();
        await ensureReportsDirectory();
      } catch (e) {
        console.warn('Storage init warning:', e);
      } finally {
        setStorageReady(true);
      }
    }
    initStorage();
  }, []);

  // Show loading screen until everything is ready
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashIcon}>📍</Text>
        <Text style={styles.splashTitle}>GeoProof</Text>
        <ActivityIndicator color="#3D8BFF" style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (dbError) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashIcon}>⚠️</Text>
        <Text style={styles.splashTitle}>Database Error</Text>
        <Text style={styles.splashSub}>Failed to initialize database: {dbError.message}</Text>
      </View>
    );
  }

  if (!dbReady || !storageReady) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashIcon}>📍</Text>
        <Text style={styles.splashTitle}>GeoProof</Text>
        <Text style={styles.splashSub}>Initializing…</Text>
        <ActivityIndicator color="#3D8BFF" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  splashIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  splashTitle: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  splashSub: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
});
