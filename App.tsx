import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    StatusBar,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';
import ItemForm from './src/components/ItemForm';
import ObjectDetectionService from './src/services/ObjectDetectionService';

const App: React.FC = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [detectedItem, setDetectedItem] = useState<string>('');
    const [showForm, setShowForm] = useState(false);

    const devices = useCameraDevices();
    const device = devices.find(d => d.position === 'back');

    useEffect(() => {
        requestCameraPermission();
        initializeTensorFlow();
    }, []);

    const requestCameraPermission = async () => {
        try {
            const permission = Platform.OS === 'ios'
                ? PERMISSIONS.IOS.CAMERA
                : PERMISSIONS.ANDROID.CAMERA;

            const result = await request(permission);
            setHasPermission(result === RESULTS.GRANTED);
        } catch (error) {
            console.error('Permission request failed:', error);
        }
    };

    const initializeTensorFlow = async () => {
        try {
            await ObjectDetectionService.initialize();
        } catch (error) {
            console.error('TensorFlow initialization failed:', error);
        }
    };

    const capturePhoto = async () => {
        if (!device) {
            Alert.alert('Error', 'Camera device not available');
            return;
        }

        try {
            setIsCameraActive(true);
            // In a real implementation, you would capture the photo here
            // and process it with the AI model
            const mockDetectedItem = await ObjectDetectionService.detectObject();
            setDetectedItem(mockDetectedItem);
            setShowForm(true);
            setIsCameraActive(false);
        } catch (error) {
            console.error('Photo capture failed:', error);
            Alert.alert('Error', 'Failed to capture photo');
            setIsCameraActive(false);
        }
    };

    const handleFormSubmit = (formData: any) => {
        Alert.alert('Success', `Item "${formData.itemName}" has been saved!`);
        setShowForm(false);
        setDetectedItem('');
    };

    if (!hasPermission) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>
                        Camera permission is required to use this app
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (showForm) {
        return (
            <SafeAreaView style={styles.container}>
                <ItemForm
                    detectedItem={detectedItem}
                    onSubmit={handleFormSubmit}
                    onBack={() => setShowForm(false)}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View style={styles.cameraContainer}>
                {device && (
                    <Camera
                        style={styles.camera}
                        device={device}
                        isActive={isCameraActive}
                        photo={true}
                    />
                )}

                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Object Detection</Text>
                        <Text style={styles.subtitle}>Point camera at an item to detect</Text>
                    </View>

                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={capturePhoto}
                            disabled={isCameraActive}
                        >
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

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
    },
    cameraContainer: {
        flex: 1,
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
        paddingTop: 50,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        color: '#fff',
        fontSize: 16,
        opacity: 0.8,
    },
    bottomContainer: {
        paddingBottom: 50,
        alignItems: 'center',
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
});

export default App;
