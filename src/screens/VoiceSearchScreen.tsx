import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import StorageService, { SavedItem } from '../services/StorageService';

type RootStackParamList = {
    MainMenu: undefined;
    ObjectDetection: undefined;
    VoiceSearch: undefined;
    SearchResults: { query: string; results: SavedItem[] };
};

type VoiceSearchScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'VoiceSearch'>;
};

export default function VoiceSearchScreen({ navigation }: VoiceSearchScreenProps) {
    const { t, i18n } = useTranslation();
    const [recognizedText, setRecognizedText] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        // Initialize TTS
        Tts.setDefaultLanguage(i18n.language === 'vi' ? 'vi-VN' : 'en-US');

        // Voice recognition event listeners
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;

        // Request microphone permission on Android
        requestMicrophonePermission();

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    useEffect(() => {
        // Update TTS language when language changes
        Tts.setDefaultLanguage(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
    }, [i18n.language]);

    const requestMicrophonePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: 'Microphone Permission',
                        message: 'This app needs access to your microphone for voice search.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Microphone access is required for voice search.');
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    const onSpeechStart = () => {
        setIsListening(true);
    };

    const onSpeechEnd = () => {
        setIsListening(false);
    };

    const onSpeechResults = (event: any) => {
        if (event.value && event.value.length > 0) {
            const voiceText = event.value[0];
            handleVoiceInput(voiceText);
        }
    };

    const onSpeechError = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        Alert.alert('Error', 'Could not recognize speech. Please try again.');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'vi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const startVoiceRecognition = async () => {
        try {
            setRecognizedText('');
            await Voice.start(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            Alert.alert('Error', 'Failed to start voice recognition. Please try again.');
        }
    };

    const stopVoiceRecognition = async () => {
        try {
            await Voice.stop();
            setIsListening(false);
        } catch (error) {
            console.error('Failed to stop voice recognition:', error);
        }
    };

    const handleVoiceInput = async (voiceText: string) => {
        setRecognizedText(voiceText);
        setIsSearching(true);

        // Speak back what was recognized using React Native TTS
        const message = i18n.language === 'vi'
            ? `Bạn muốn tìm ${voiceText}`
            : `You want to find ${voiceText}`;
        Tts.speak(message);

        try {
            // Extract search query from voice input
            // Support patterns like "I want to find a cup", "Find cup", "Search for cup"
            let searchQuery = voiceText.toLowerCase();

            // Remove common prefixes
            const patterns = [
                /^(i want to find|i want to search|find|search for|looking for)\s+/i,
                /^(a|an|the)\s+/i,
            ];

            patterns.forEach(pattern => {
                searchQuery = searchQuery.replace(pattern, '');
            });

            console.log('Searching for:', searchQuery);

            // Search in storage
            const results = await StorageService.searchItems(searchQuery.trim());

            setIsSearching(false);

            // Speak the result using React Native TTS
            if (results.length > 0) {
                const message = i18n.language === 'vi'
                    ? `Tìm thấy ${results.length} kết quả`
                    : `Found ${results.length} result${results.length > 1 ? 's' : ''}`;
                Tts.speak(message);

                // Navigate to results
                navigation.navigate('SearchResults', { query: searchQuery, results });
            } else {
                const message = i18n.language === 'vi'
                    ? 'Không tìm thấy kết quả'
                    : 'No items found';
                Tts.speak(message);
                Alert.alert(t('voiceSearch.noResults'), t('voiceSearch.tryAgain'));
            }
        } catch (error) {
            console.error('Search failed:', error);
            setIsSearching(false);
            Alert.alert('Error', 'Search failed. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← {t('common.back')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.languageButton}
                    onPress={toggleLanguage}
                >
                    <Text style={styles.languageButtonText}>
                        {i18n.language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.emoji}>🎤</Text>
                <Text style={styles.title}>{t('voiceSearch.title')}</Text>
                <Text style={styles.subtitle}>{t('voiceSearch.subtitle')}</Text>

                {recognizedText ? (
                    <View style={styles.recognizedBox}>
                        <Text style={styles.recognizedLabel}>{t('voiceSearch.recognized')}:</Text>
                        <Text style={styles.recognizedText}>{recognizedText}</Text>
                    </View>
                ) : null}

                {isSearching ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#e74c3c" />
                        <Text style={styles.loadingText}>{t('voiceSearch.searching')}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.micButton, isListening && styles.micButtonListening]}
                        onPress={isListening ? stopVoiceRecognition : startVoiceRecognition}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.micEmoji}>🎙️</Text>
                        <Text style={styles.micButtonText}>
                            {isListening ? t('voiceSearch.listening') || 'Listening...' : t('voiceSearch.tapToSpeak')}
                        </Text>
                    </TouchableOpacity>
                )}

                <View style={styles.examplesContainer}>
                    <Text style={styles.examplesTitle}>{t('voiceSearch.examples')}:</Text>
                    <Text style={styles.exampleText}>• "{t('voiceSearch.example1')}"</Text>
                    <Text style={styles.exampleText}>• "{t('voiceSearch.example2')}"</Text>
                    <Text style={styles.exampleText}>• "{t('voiceSearch.example3')}"</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    languageButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    languageButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 40,
    },
    emoji: {
        fontSize: 100,
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    recognizedBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    recognizedLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        marginBottom: 8,
    },
    recognizedText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 20,
    },
    micButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
        marginTop: 20,
    },
    micButtonListening: {
        backgroundColor: '#27ae60',
        transform: [{ scale: 1.1 }],
    },
    micEmoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    micButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    examplesContainer: {
        marginTop: 50,
        width: '100%',
    },
    examplesTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    exampleText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        marginBottom: 10,
        paddingLeft: 10,
    },
});

