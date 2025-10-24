import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import StorageService, { SavedItem } from '../services/StorageService';

type RootStackParamList = {
    MainMenu: undefined;
    ObjectDetection: undefined;
    VoiceSearch: undefined;
    SearchResults: { query: string; results: SavedItem[] };
};

type SearchResultsScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'SearchResults'>;
    route: RouteProp<RootStackParamList, 'SearchResults'>;
};

export default function SearchResultsScreen({ navigation, route }: SearchResultsScreenProps) {
    const { t, i18n } = useTranslation();
    const { query, results } = route.params;
    const [items, setItems] = React.useState<SavedItem[]>(results);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'vi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleDeleteItem = (item: SavedItem) => {
        Alert.alert(
            t('searchResults.deleteConfirmTitle'),
            t('searchResults.deleteConfirmMessage', { name: item.itemName }),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel'
                },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await StorageService.deleteItem(item.id);
                            setItems(prevItems => prevItems.filter(i => i.id !== item.id));
                            Alert.alert(t('common.success'), t('searchResults.deleteSuccess'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('searchResults.deleteFailed'));
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: SavedItem }) => {
        const date = new Date(item.dateAdded);
        const formattedDate = date.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

        return (
            <View style={styles.itemCard}>
                <View style={styles.itemHeader}>
                    <View style={styles.itemTitleRow}>
                        <Text style={styles.itemName}>{item.itemName}</Text>
                        <View style={[styles.colorBadge, { backgroundColor: getColorHex(item.color) }]} />
                    </View>
                    <Text style={styles.itemDate}>{formattedDate}</Text>
                </View>

                <View style={styles.itemDetails}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('form.color')}:</Text>
                        <Text style={styles.detailValue}>{item.color}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('form.category')}:</Text>
                        <Text style={styles.detailValue}>{item.category}</Text>
                    </View>
                    {item.description ? (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{t('form.description')}:</Text>
                            <Text style={styles.detailValue}>{item.description}</Text>
                        </View>
                    ) : null}
                </View>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item)}
                >
                    <Text style={styles.deleteButtonText}>🗑️ {t('common.delete')}</Text>
                </TouchableOpacity>
            </View>
        );
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

            {/* Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{t('searchResults.title')}</Text>
                <Text style={styles.queryText}>
                    "{query}" - {items.length} {t('searchResults.resultsFound')}
                </Text>
            </View>

            {/* Results List */}
            {items.length > 0 ? (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>😔</Text>
                    <Text style={styles.emptyText}>{t('searchResults.noItems')}</Text>
                </View>
            )}
        </View>
    );
}

// Helper function to convert color name to hex (simplified)
function getColorHex(colorName: string): string {
    const colorMap: Record<string, string> = {
        'Red': '#e74c3c',
        'Green': '#27ae60',
        'Blue': '#3498db',
        'Yellow': '#f1c40f',
        'Orange': '#e67e22',
        'Purple': '#9b59b6',
        'Pink': '#ff69b4',
        'Brown': '#8b4513',
        'Black': '#2c3e50',
        'White': '#ecf0f1',
        'Gray': '#95a5a6',
        'Grey': '#95a5a6',
        'Light Gray': '#bdc3c7',
        'Dark Gray': '#7f8c8d',
        'Light Blue': '#89CFF0',
        'Dark Green': '#0b6623',
        'Light Green': '#90EE90',
        'Cyan': '#00FFFF',
        'Magenta': '#FF00FF',
        'Silver': '#C0C0C0',
        'Unknown': '#95a5a6',
    };

    return colorMap[colorName] || '#95a5a6';
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
    titleContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    queryText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    itemCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    itemHeader: {
        marginBottom: 15,
    },
    itemTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    colorBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    itemDate: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    itemDetails: {
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
        width: 100,
    },
    detailValue: {
        fontSize: 14,
        color: '#fff',
        flex: 1,
    },
    deleteButton: {
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e74c3c',
    },
    deleteButtonText: {
        color: '#e74c3c',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyEmoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 18,
        textAlign: 'center',
    },
});

