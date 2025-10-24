import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import './src/i18n/config'; // Initialize i18n

import MainMenuScreen from './src/screens/MainMenuScreen';
import ObjectDetectionScreen from './src/screens/ObjectDetectionScreen';
import VoiceSearchScreen from './src/screens/VoiceSearchScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import ObjectDetectionService from './src/services/ObjectDetectionService';
import { SavedItem } from './src/services/StorageService';

export type RootStackParamList = {
  MainMenu: undefined;
  ObjectDetection: undefined;
  VoiceSearch: undefined;
  SearchResults: { query: string; results: SavedItem[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    initializeTensorFlow();
  }, []);

  const initializeTensorFlow = async () => {
    try {
      setIsModelLoading(true);
      console.log('Starting TensorFlow initialization...');

      // Initialize TensorFlow for React Native
      await tf.ready();
      console.log('TensorFlow ready');

      // Initialize the object detection model
      await ObjectDetectionService.initialize();
      console.log('Object detection service initialized');

      const modelInfo = ObjectDetectionService.getModelInfo();
      console.log('Model info:', modelInfo);

      setIsModelLoading(false);
    } catch (error) {
      console.error('TensorFlow initialization failed:', error);
      setIsModelLoading(false);
      setInitializationError(String(error));
      Alert.alert(
        'Initialization Error',
        'Failed to load AI model. Some features may not work properly.',
        [{ text: 'OK' }]
      );
    }
  };

  if (isModelLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Loading AI Model...</Text>
        <Text style={styles.loadingSubtext}>Please wait while we initialize TensorFlow</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="ObjectDetection" component={ObjectDetectionScreen} />
        <Stack.Screen name="VoiceSearch" component={VoiceSearchScreen} />
        <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  loadingSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default App;
