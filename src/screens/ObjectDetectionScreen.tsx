import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ItemForm from '../components/ItemForm';
import ObjectDetectionService, { DetectionResult } from '../services/ObjectDetectionService';
import StorageService from '../services/StorageService';

type RootStackParamList = {
    MainMenu: undefined;
    ObjectDetection: undefined;
    VoiceSearch: undefined;
};

type ObjectDetectionScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'ObjectDetection'>;
};

export default function ObjectDetectionScreen({ navigation }: ObjectDetectionScreenProps) {
    const { t, i18n } = useTranslation();
    const [permission, requestPermission] = useCameraPermissions();
    const [detectedItem, setDetectedItem] = useState<DetectionResult | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [facing, setFacing] = useState<CameraType>('back');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'vi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const capturePhoto = async () => {
        if (!cameraRef.current) {
            Alert.alert('Error', 'Camera not ready');
            return;
        }

        if (!ObjectDetectionService.isModelReady()) {
            Alert.alert('Please Wait', 'AI model is still loading...');
            return;
        }

        try {
            setIsProcessing(true);
            console.log('Capturing photo...');

            const photo = await cameraRef.current.takePictureAsync({
                quality: 1.0,
                base64: false,
                skipProcessing: false,
                imageType: 'jpg',
                exif: false,
                shutterSound: false,
            });

            if (!photo || !photo.uri) {
                throw new Error('Failed to capture photo');
            }

            console.log('Photo captured:', photo.uri);
            console.log('Processing with AI model...');

            const detectedObject = await ObjectDetectionService.detectObject(photo.uri, true);

            console.log('Detection complete:', detectedObject);

            if (detectedObject.confidence < 0.5) {
                const confidencePercent = (detectedObject.confidence * 100).toFixed(1);
                setIsProcessing(false);
                Alert.alert(
                    '⚠️ Low Confidence Detection',
                    `Detected "${detectedObject.itemName}" with only ${confidencePercent}% confidence.\n\nFor better results:\n• Move closer to the object\n• Ensure good lighting\n• Place object within green frame\n• Try a simpler background\n\nWould you like to recapture?`,
                    [
                        {
                            text: 'Recapture',
                            onPress: () => console.log('User will recapture'),
                            style: 'default'
                        },
                        {
                            text: 'Continue Anyway',
                            onPress: () => {
                                setDetectedItem(detectedObject);
                                setShowForm(true);
                            },
                            style: 'cancel'
                        }
                    ]
                );
                return;
            }

            setDetectedItem(detectedObject);
            setShowForm(true);
            setIsProcessing(false);
        } catch (error) {
            console.error('Photo capture/detection failed:', error);
            Alert.alert('Error', `Failed to process photo: ${error}`);
            setIsProcessing(false);
        }
    };

    const handleFormSubmit = async (formData: any) => {
        try {
            // Save item to storage
            await StorageService.saveItem({
                itemName: formData.itemName,
                color: formData.color,
                category: formData.category,
                description: formData.description,
            });

            Alert.alert('Success', `Item "${formData.itemName}" has been saved!`, [
                {
                    text: 'OK',
                    onPress: () => {
                        setShowForm(false);
                        setDetectedItem(null);
                        navigation.navigate('MainMenu');
                    }
                }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save item');
        }
    };

    const testWithSampleImage = async () => {
        if (!ObjectDetectionService.isModelReady()) {
            Alert.alert('Please Wait', 'AI model is still loading...');
            return;
        }

        try {
            setIsTesting(true);
            console.log('Testing with sample image...');

            const result = await ObjectDetectionService.testWithSampleImage();

            setIsTesting(false);
            const confidencePercent = (result.confidence * 100).toFixed(1);
            Alert.alert('Test Result', `Detected: ${result.itemName}\nColor: ${result.color}\nConfidence: ${confidencePercent}%`, [
                { text: 'OK', onPress: () => console.log('Test complete') }
            ]);
        } catch (error) {
            console.error('Test failed:', error);
            setIsTesting(false);
            Alert.alert('Test Failed', `Error: ${error}`);
        }
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.permissionText}>{t('permissions.loading')}</Text>
                </View>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>
                        Camera permission is required
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={async () => {
                            const result = await requestPermission();
                            if (result.granted) {
                                console.log('✅ Camera permission granted!');
                            }
                        }}
                    >
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.permissionButton, { marginTop: 12, backgroundColor: '#e74c3c' }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.permissionButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (showForm) {
        return (
            <View style={styles.container}>
                <ItemForm
                    detectedItem={detectedItem}
                    onSubmit={handleFormSubmit}
                    onBack={() => setShowForm(false)}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <CameraView style={styles.camera} facing={facing} ref={cameraRef} flash="off">
                <View style={styles.overlay}>
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

                        <View style={styles.instructionBox}>
                            <Text style={styles.instructionEmoji}>📸</Text>
                            <Text style={styles.instructionTitle}>{t('camera.title')}</Text>
                            <Text style={styles.instructionSubtitle}>{t('camera.subtitle')}</Text>
                        </View>
                    </View>

                    <View style={styles.captureGuide}>
                        <View style={styles.guideCornerTopLeft} />
                        <View style={styles.guideCornerTopRight} />
                        <View style={styles.guideCornerBottomLeft} />
                        <View style={styles.guideCornerBottomRight} />
                    </View>

                    {isProcessing && (
                        <View style={styles.processingOverlay}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.processingText}>{t('camera.processing')}</Text>
                        </View>
                    )}

                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            style={styles.testButton}
                            onPress={testWithSampleImage}
                            disabled={isTesting || !ObjectDetectionService.isModelReady()}
                        >
                            <Text style={styles.testButtonText}>
                                {isTesting ? t('camera.testing') : t('camera.test')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.captureButton,
                                (isProcessing || !ObjectDetectionService.isModelReady()) &&
                                styles.captureButtonDisabled
                            ]}
                            onPress={capturePhoto}
                            disabled={isProcessing || !ObjectDetectionService.isModelReady()}
                        >
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    permissionButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
    },
    header: {
        paddingTop: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 10,
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    languageButton: {
        position: 'absolute',
        top: 10,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    languageButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    instructionBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(0, 255, 0, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
    instructionEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    instructionTitle: {
        color: '#00FF00',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    instructionSubtitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 4,
        opacity: 0.9,
    },
    processingOverlay: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        alignItems: 'center',
        transform: [{ translateY: -50 }],
    },
    processingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    bottomContainer: {
        paddingBottom: 50,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
    },
    testButton: {
        backgroundColor: 'rgba(0, 122, 255, 0.9)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#fff',
        minWidth: 80,
        alignItems: 'center',
    },
    testButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    captureButtonDisabled: {
        opacity: 0.5,
    },
    captureGuide: {
        position: 'absolute',
        top: '25%',
        left: '10%',
        right: '10%',
        bottom: '25%',
        pointerEvents: 'none',
    },
    guideCornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 60,
        height: 60,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#00FF00',
        borderTopLeftRadius: 8,
    },
    guideCornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: '#00FF00',
        borderTopRightRadius: 8,
    },
    guideCornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 60,
        height: 60,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#00FF00',
        borderBottomLeftRadius: 8,
    },
    guideCornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 60,
        height: 60,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#00FF00',
        borderBottomRightRadius: 8,
    },
});

