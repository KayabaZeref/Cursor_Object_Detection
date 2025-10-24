import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedItem {
    id: string;
    itemName: string;
    color: string;
    category: string;
    description: string;
    dateAdded: string;
}

const STORAGE_KEY = '@saved_items';

class StorageService {
    /**
     * Initialize storage with sample items if empty
     */
    static async initializeSampleData(): Promise<void> {
        try {
            const existingItems = await this.getAllItems();
            if (existingItems.length === 0) {
                console.log('📦 Initializing sample data...');
                const sampleItems: SavedItem[] = [
                    {
                        id: '1',
                        itemName: 'Cup',
                        color: 'Green',
                        category: 'Kitchen',
                        description: 'Green ceramic cup for coffee',
                        dateAdded: new Date('2025-10-20').toISOString(),
                    },
                    {
                        id: '2',
                        itemName: 'Cup',
                        color: 'Blue',
                        category: 'Kitchen',
                        description: 'Blue glass cup for water',
                        dateAdded: new Date('2025-10-21').toISOString(),
                    },
                    {
                        id: '3',
                        itemName: 'Bottle',
                        color: 'Red',
                        category: 'Kitchen',
                        description: 'Red water bottle',
                        dateAdded: new Date('2025-10-22').toISOString(),
                    },
                    {
                        id: '4',
                        itemName: 'Book',
                        color: 'Brown',
                        category: 'Study',
                        description: 'Programming textbook',
                        dateAdded: new Date('2025-10-19').toISOString(),
                    },
                    {
                        id: '5',
                        itemName: 'Cell Phone',
                        color: 'Black',
                        category: 'Electronics',
                        description: 'Smartphone for daily use',
                        dateAdded: new Date('2025-10-18').toISOString(),
                    },
                    {
                        id: '6',
                        itemName: 'Laptop',
                        color: 'Silver',
                        category: 'Electronics',
                        description: 'Work laptop',
                        dateAdded: new Date('2025-10-17').toISOString(),
                    },
                    {
                        id: '7',
                        itemName: 'Chair',
                        color: 'Brown',
                        category: 'Furniture',
                        description: 'Wooden office chair',
                        dateAdded: new Date('2025-10-16').toISOString(),
                    },
                    {
                        id: '8',
                        itemName: 'Bottle',
                        color: 'Green',
                        category: 'Kitchen',
                        description: 'Green reusable water bottle',
                        dateAdded: new Date('2025-10-15').toISOString(),
                    },
                ];
                await this.saveItems(sampleItems);
                console.log('✅ Sample data initialized with', sampleItems.length, 'items');
            }
        } catch (error) {
            console.error('Failed to initialize sample data:', error);
        }
    }

    /**
     * Save a new item
     */
    static async saveItem(item: Omit<SavedItem, 'id' | 'dateAdded'>): Promise<SavedItem> {
        try {
            const items = await this.getAllItems();
            const newItem: SavedItem = {
                ...item,
                id: Date.now().toString(),
                dateAdded: new Date().toISOString(),
            };
            items.push(newItem);
            await this.saveItems(items);
            console.log('✅ Item saved:', newItem.itemName);
            return newItem;
        } catch (error) {
            console.error('Failed to save item:', error);
            throw error;
        }
    }

    /**
     * Get all items
     */
    static async getAllItems(): Promise<SavedItem[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            return jsonValue ? JSON.parse(jsonValue) : [];
        } catch (error) {
            console.error('Failed to load items:', error);
            return [];
        }
    }

    /**
     * Search items by name (case-insensitive)
     */
    static async searchItems(query: string): Promise<SavedItem[]> {
        try {
            const items = await this.getAllItems();
            const normalizedQuery = query.toLowerCase().trim();
            return items.filter(item =>
                item.itemName.toLowerCase().includes(normalizedQuery)
            );
        } catch (error) {
            console.error('Failed to search items:', error);
            return [];
        }
    }

    /**
     * Delete an item by ID
     */
    static async deleteItem(id: string): Promise<void> {
        try {
            const items = await this.getAllItems();
            const filteredItems = items.filter(item => item.id !== id);
            await this.saveItems(filteredItems);
            console.log('✅ Item deleted');
        } catch (error) {
            console.error('Failed to delete item:', error);
            throw error;
        }
    }

    /**
     * Save all items (internal method)
     */
    private static async saveItems(items: SavedItem[]): Promise<void> {
        try {
            const jsonValue = JSON.stringify(items);
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        } catch (error) {
            console.error('Failed to save items:', error);
            throw error;
        }
    }

    /**
     * Clear all items (for testing)
     */
    static async clearAllItems(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            console.log('✅ All items cleared');
        } catch (error) {
            console.error('Failed to clear items:', error);
            throw error;
        }
    }
}

export default StorageService;

