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
} from 'react-native';

interface ItemFormProps {
    detectedItem: string;
    onSubmit: (formData: any) => void;
    onBack: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ detectedItem, onSubmit, onBack }) => {
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        category: '',
        price: '',
        quantity: '1',
    });

    useEffect(() => {
        // Auto-fill the item name with detected object
        if (detectedItem) {
            setFormData(prev => ({
                ...prev,
                itemName: detectedItem,
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
        'Electronics',
        'Clothing',
        'Food & Beverages',
        'Books',
        'Home & Garden',
        'Sports',
        'Toys',
        'Other',
    ];

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Item Details</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Item Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.itemName}
                            onChangeText={(value) => handleInputChange('itemName', value)}
                            placeholder="Enter item name"
                            placeholderTextColor="#999"
                        />
                        {detectedItem && (
                            <Text style={styles.detectedText}>
                                Detected: {detectedItem}
                            </Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(value) => handleInputChange('description', value)}
                            placeholder="Enter item description"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoryScroll}
                        >
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryButton,
                                        formData.category === category && styles.categoryButtonSelected,
                                    ]}
                                    onPress={() => handleInputChange('category', category)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryButtonText,
                                            formData.category === category && styles.categoryButtonTextSelected,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Price</Text>
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
                            <Text style={styles.label}>Quantity</Text>
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
                        <Text style={styles.submitButtonText}>Save Item</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
});

export default ItemForm;
