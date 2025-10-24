import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import StorageService from '../services/StorageService';

type RootStackParamList = {
    MainMenu: undefined;
    ObjectDetection: undefined;
    VoiceSearch: undefined;
};

type MainMenuScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'MainMenu'>;
};

export default function MainMenuScreen({ navigation }: MainMenuScreenProps) {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        // Initialize sample data on first launch
        StorageService.initializeSampleData();
    }, []);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(newLang);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with language button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.languageButton}
                    onPress={toggleLanguage}
                >
                    <Text style={styles.languageButtonText}>
                        {i18n.language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* App Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.emoji}>🔍</Text>
                <Text style={styles.title}>{t('mainMenu.title')}</Text>
                <Text style={styles.subtitle}>{t('mainMenu.subtitle')}</Text>
            </View>

            {/* Menu Buttons */}
            <View style={styles.menuContainer}>
                {/* Object Detection Button */}
                <TouchableOpacity
                    style={[styles.menuButton, styles.detectionButton]}
                    onPress={() => navigation.navigate('ObjectDetection')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonEmoji}>📸</Text>
                    <Text style={styles.buttonTitle}>{t('mainMenu.objectDetection')}</Text>
                    <Text style={styles.buttonDescription}>
                        {t('mainMenu.objectDetectionDesc')}
                    </Text>
                </TouchableOpacity>

                {/* Voice Search Button */}
                <TouchableOpacity
                    style={[styles.menuButton, styles.voiceButton]}
                    onPress={() => navigation.navigate('VoiceSearch')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonEmoji}>🎤</Text>
                    <Text style={styles.buttonTitle}>{t('mainMenu.voiceSearch')}</Text>
                    <Text style={styles.buttonDescription}>
                        {t('mainMenu.voiceSearchDesc')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>{t('mainMenu.footer')}</Text>
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
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
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
    titleContainer: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 60,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 20,
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
        paddingHorizontal: 40,
    },
    menuContainer: {
        flex: 1,
        paddingHorizontal: 30,
        gap: 20,
    },
    menuButton: {
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    detectionButton: {
        backgroundColor: '#4a90e2',
    },
    voiceButton: {
        backgroundColor: '#e74c3c',
    },
    buttonEmoji: {
        fontSize: 50,
        marginBottom: 15,
    },
    buttonTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    buttonDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        paddingBottom: 30,
        paddingTop: 20,
    },
});

