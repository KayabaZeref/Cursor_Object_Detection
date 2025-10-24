import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { DetectionResult } from '../services/ObjectDetectionService';
import ColorPicker from 'react-native-wheel-color-picker';

interface ItemFormProps {
    detectedItem: DetectionResult | null;
    onSubmit: (formData: any) => void;
    onBack: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ detectedItem, onSubmit, onBack }) => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        category: '',
        color: '',
        price: '',
        quantity: '1',
    });
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#FF0000');

    // Language switcher
    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'vi' : 'en';
        i18n.changeLanguage(newLang);
    };

    useEffect(() => {
        // Auto-fill the item name and color with detected values
        if (detectedItem) {
            setFormData(prev => ({
                ...prev,
                itemName: detectedItem.itemName,
                color: detectedItem.color,
            }));
        }
    }, [detectedItem]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = () => {
        if (!formData.itemName.trim()) {
            Alert.alert('Error', 'Item name is required');
            return;
        }

        onSubmit(formData);
    };

    const categories = [
        { key: 'electronics', label: t('categories.electronics') },
        { key: 'clothing', label: t('categories.clothing') },
        { key: 'foodBeverages', label: t('categories.foodBeverages') },
        { key: 'books', label: t('categories.books') },
        { key: 'homeGarden', label: t('categories.homeGarden') },
        { key: 'sports', label: t('categories.sports') },
        { key: 'toys', label: t('categories.toys') },
        { key: 'other', label: t('categories.other') },
    ];

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>← {t('form.back')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('form.title')}</Text>
                    <TouchableOpacity
                        style={styles.languageButton}
                        onPress={toggleLanguage}
                    >
                        <Text style={styles.languageButtonText}>
                            {i18n.language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('form.itemName')} *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.itemName}
                            onChangeText={(value) => handleInputChange('itemName', value)}
                            placeholder={t('form.itemName')}
                            placeholderTextColor="#999"
                        />
                        {detectedItem && (
                            <Text style={styles.detectedText}>
                                {t('form.detected')}: {detectedItem.itemName}
                            </Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('form.color')}</Text>
                        <View style={styles.colorContainer}>
                            <TextInput
                                style={[styles.input, styles.colorInput]}
                                value={formData.color}
                                onChangeText={(value) => handleInputChange('color', value)}
                                placeholder={t('form.color')}
                                placeholderTextColor="#999"
                                editable={false}
                            />
                            <TouchableOpacity
                                style={[styles.colorPreview, { backgroundColor: selectedColor }]}
                                onPress={() => setShowColorPicker(true)}
                            >
                                <Text style={styles.colorPickerText}>🎨</Text>
                            </TouchableOpacity>
                        </View>
                        {detectedItem && (
                            <Text style={styles.detectedText}>
                                {t('form.detected')}: {detectedItem.color}
                            </Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('form.description')}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(value) => handleInputChange('description', value)}
                            placeholder={t('form.description')}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('form.category')}</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoryScroll}
                        >
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.key}
                                    style={[
                                        styles.categoryButton,
                                        formData.category === category.key && styles.categoryButtonSelected,
                                    ]}
                                    onPress={() => handleInputChange('category', category.key)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryButtonText,
                                            formData.category === category.key && styles.categoryButtonTextSelected,
                                        ]}
                                    >
                                        {category.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>{t('form.price')}</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.price}
                                onChangeText={(value) => handleInputChange('price', value)}
                                placeholder="0.00"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>{t('form.quantity')}</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.quantity}
                                onChangeText={(value) => handleInputChange('quantity', value)}
                                placeholder="1"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>{t('form.submit')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Color Picker Modal */}
            <Modal
                visible={showColorPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowColorPicker(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.colorPickerContainer}>
                        <Text style={styles.modalTitle}>{t('form.selectColor')}</Text>
                        <ColorPicker
                            color={selectedColor}
                            onColorChange={(color) => setSelectedColor(color)}
                            thumbSize={30}
                            sliderSize={30}
                            noSnap={true}
                            row={false}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowColorPicker(false)}
                            >
                                <Text style={styles.modalButtonText}>{t('form.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.selectButton]}
                                onPress={() => {
                                    handleInputChange('color', selectedColor);
                                    setShowColorPicker(false);
                                }}
                            >
                                <Text style={styles.modalButtonText}>{t('form.select')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginBottom: 10,
    },
    backButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500',
    },
    languageButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    languageButtonText: {
        color: '#007AFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    detectedText: {
        fontSize: 12,
        color: '#007AFF',
        marginTop: 4,
        fontStyle: 'italic',
    },
    categoryScroll: {
        marginTop: 8,
    },
    categoryButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
    },
    categoryButtonSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    categoryButtonTextSelected: {
        color: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    colorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    colorInput: {
        flex: 1,
    },
    colorPreview: {
        width: 50,
        height: 50,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorPickerText: {
        fontSize: 24,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    colorPickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    colorPicker: {
        height: 300,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    selectButton: {
        backgroundColor: '#007AFF',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ItemForm;

