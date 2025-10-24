# Code Workflow & Execution Guide

This document explains **how the code runs and executes** from start to finish, including the flow of data, component lifecycle, and user interactions.

---

## 📋 Table of Contents

1. [App Initialization](#1-app-initialization)
2. [Main Menu Screen](#2-main-menu-screen)
3. [Object Detection Flow](#3-object-detection-flow)
4. [Voice Search Flow](#4-voice-search-flow)
5. [Search Results Flow](#5-search-results-flow)
6. [Data Flow Architecture](#6-data-flow-architecture)
7. [Services & Storage](#7-services--storage)

---

## 1. App Initialization

### Step 1.1: Entry Point
```
index.ts (Expo Entry Point)
    ↓
App.tsx (Root Component)
```

**What happens:**
- Expo loads `index.ts` which registers the root component
- React Native runtime initializes
- `App.tsx` component mounts

### Step 1.2: App.tsx Initialization

```typescript
// File: App.tsx
export default function App() {
    // 1. Initialize i18n for multi-language support
    const { i18n } = useTranslation();
    
    // 2. Initialize navigation state
    const [currentScreen, setCurrentScreen] = useState<'MainMenu' | 'ObjectDetection' | ...>('MainMenu');
    
    // 3. Load TensorFlow.js and COCO-SSD model
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState('');
    
    useEffect(() => {
        initializeApp();
    }, []);
}
```

**Execution Flow:**
1. **i18n initialization** → Loads translations from `src/i18n/locales/en.json` and `vi.json`
2. **State setup** → Initializes all React state variables
3. **TensorFlow.js setup** → Waits for platform to be ready
4. **Model loading** → Downloads COCO-SSD model (~10MB, first time only)
5. **Navigation ready** → Shows MainMenu screen

**Timeline:**
- First launch: ~30-60 seconds (model download)
- Subsequent launches: ~2-3 seconds (cached model)

---

## 2. Main Menu Screen

### Step 2.1: Screen Component

```typescript
// File: src/screens/MainMenuScreen.tsx
export default function MainMenuScreen({ navigation }) {
    return (
        <View>
            {/* Object Detection Button */}
            <TouchableOpacity onPress={() => navigation.navigate('ObjectDetection')}>
            
            {/* Voice Search Button */}
            <TouchableOpacity onPress={() => navigation.navigate('VoiceSearch')}>
        </View>
    );
}
```

**User Actions:**
- **Tap "Object Detection"** → Navigate to ObjectDetectionScreen
- **Tap "Voice Search"** → Navigate to VoiceSearchScreen
- **Tap Language Button** → Toggle between English/Vietnamese

---

## 3. Object Detection Flow

### Step 3.1: Camera Screen Initialization

```
User taps "Object Detection"
    ↓
Navigate to ObjectDetectionScreen
    ↓
Request Camera Permissions
    ↓
Initialize Camera
```

**Code Execution:**

```typescript
// File: src/screens/ObjectDetectionScreen.tsx

// Step 1: Check permissions
const [permission, requestPermission] = useCameraPermissions();

// Step 2: Initialize camera reference
const cameraRef = useRef<CameraView>(null);

// Step 3: Setup camera with flash mode
const [flash, setFlash] = useState<'off' | 'on'>('off');
```

### Step 3.2: Capture Photo Process

```
User taps Capture Button (📷)
    ↓
takePictureAsync()
    ↓
Save photo to temp storage
    ↓
Pass URI to ObjectDetectionService
    ↓
AI processes image
    ↓
Return detected object
    ↓
Navigate to ItemForm
```

**Detailed Code Flow:**

```typescript
const handleCapture = async () => {
    // 1. Show processing state
    setIsProcessing(true);
    
    // 2. Capture photo from camera
    const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
        base64: false,
    });
    
    // 3. Process with AI
    const detection = await ObjectDetectionService.detectObject(photo.uri);
    
    // 4. Navigate to form with detected data
    navigation.navigate('ItemForm', {
        detectedItem: detection.class,
        confidence: detection.score,
        photoUri: photo.uri,
    });
    
    // 5. Hide processing state
    setIsProcessing(false);
};
```

### Step 3.3: AI Detection Process

```
Photo URI received
    ↓
Read file as base64
    ↓
Decode JPEG to pixel data
    ↓
Convert to TensorFlow tensor
    ↓
Run COCO-SSD model
    ↓
Get predictions
    ↓
Filter by confidence (>30%)
    ↓
Return highest confidence object
```

**Code in ObjectDetectionService.ts:**

```typescript
// File: src/services/ObjectDetectionService.ts

async detectObject(imageUri: string): Promise<Detection> {
    // 1. Read image file
    const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
    });
    
    // 2. Decode JPEG
    const rawImageData = jpeg.decode(buffer);
    
    // 3. Convert to tensor [height, width, 3]
    const imageTensor = tf.tensor3d(
        rawImageData.data,
        [rawImageData.height, rawImageData.width, 3]
    );
    
    // 4. Run model
    const predictions = await this.model.detect(imageTensor);
    
    // 5. Return best prediction
    return predictions[0];
}
```

### Step 3.4: Item Form Screen

```
Receive detection results
    ↓
Pre-fill form fields
    ↓
User edits/confirms data
    ↓
Tap Save
    ↓
Store in AsyncStorage
    ↓
Show success alert
    ↓
Navigate back
```

**Form Data Flow:**

```typescript
// File: src/components/ItemForm.tsx

const [formData, setFormData] = useState({
    itemName: route.params?.detectedItem || '',  // Pre-filled from AI
    color: '',
    description: '',
    category: 'other',
    price: '',
    quantity: '',
});

const handleSubmit = async () => {
    // 1. Create item object
    const item = {
        id: Date.now().toString(),
        ...formData,
        photoUri: route.params?.photoUri,
        timestamp: new Date().toISOString(),
    };
    
    // 2. Save to storage
    await StorageService.saveItem(item);
    
    // 3. Show success
    Alert.alert('Success', 'Item saved!');
    
    // 4. Navigate back
    navigation.goBack();
};
```

---

## 4. Voice Search Flow

### Step 4.1: Voice Search Screen Initialization

```
User taps "Voice Search"
    ↓
Navigate to VoiceSearchScreen
    ↓
Initialize Voice Module
    ↓
Initialize TTS Module
    ↓
Request Microphone Permission
    ↓
Setup event listeners
```

**Code Execution:**

```typescript
// File: src/screens/VoiceSearchScreen.tsx

useEffect(() => {
    // 1. Initialize TTS
    Tts.setDefaultLanguage(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
    
    // 2. Setup Voice recognition listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    
    // 3. Request microphone permission
    await requestMicrophonePermission();
    
    // 4. Cleanup on unmount
    return () => {
        Voice.destroy().then(Voice.removeAllListeners);
    };
}, []);
```

### Step 4.2: Voice Recognition Process

**Option A: Voice Input**

```
User taps "Tap to Speak"
    ↓
Start voice recognition
    ↓
Show "Listening..." animation
    ↓
Capture audio
    ↓
Send to Google Speech API
    ↓
Receive transcription
    ↓
Display recognized text
    ↓
Search for items
    ↓
Navigate to results
```

**Code Flow:**

```typescript
const startVoiceRecognition = async () => {
    // 1. Start listening
    await Voice.start(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
    
    // 2. Show listening state
    setIsListening(true);
};

const onSpeechResults = (event: any) => {
    // 3. Get recognized text
    const voiceText = event.value[0];
    
    // 4. Process search
    handleVoiceInput(voiceText);
};
```

**Option B: Text Input**

```
User taps "Type Search"
    ↓
Show modal with text input
    ↓
User types query
    ↓
Tap Search button
    ↓
Process search
    ↓
Navigate to results
```

### Step 4.3: Search Process

```
Receive search query
    ↓
Speak query back (TTS)
    ↓
Load all saved items
    ↓
Filter by query match
    ↓
Check item name, category, description
    ↓
Return matching items
    ↓
Navigate to SearchResults
```

**Code:**

```typescript
const handleVoiceInput = async (voiceText: string) => {
    // 1. Speak back
    const message = `You want to find ${voiceText}`;
    Tts.speak(message);
    
    // 2. Search in storage
    const allItems = await StorageService.getAllItems();
    const results = allItems.filter(item => 
        item.itemName.toLowerCase().includes(voiceText.toLowerCase()) ||
        item.category.toLowerCase().includes(voiceText.toLowerCase()) ||
        item.description.toLowerCase().includes(voiceText.toLowerCase())
    );
    
    // 3. Navigate to results
    if (results.length > 0) {
        navigation.navigate('SearchResults', {
            query: voiceText,
            results: results,
        });
    } else {
        Alert.alert('No Results', 'Try searching for something else');
    }
};
```

---

## 5. Search Results Flow

### Step 5.1: Display Results

```
Receive search results
    ↓
Display in FlatList
    ↓
Show item details
    ↓
User can view/delete items
```

**Code:**

```typescript
// File: src/screens/SearchResultsScreen.tsx

const { results, query } = route.params;

return (
    <FlatList
        data={results}
        renderItem={({ item }) => (
            <View>
                <Image source={{ uri: item.photoUri }} />
                <Text>{item.itemName}</Text>
                <Text>{item.category}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    Delete
                </TouchableOpacity>
            </View>
        )}
    />
);
```

### Step 5.2: Delete Item Flow

```
User taps Delete
    ↓
Show confirmation alert
    ↓
User confirms
    ↓
Remove from AsyncStorage
    ↓
Update UI (remove from list)
    ↓
Show success message
```

---

## 6. Data Flow Architecture

### Overall Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐          │
│  │ TensorFlow │  │    i18n    │  │  Navigation  │          │
│  │    Init    │  │    Init    │  │    State     │          │
│  └────────────┘  └────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────┘
                             ↓
        ┌────────────────────┼────────────────────┐
        ↓                    ↓                     ↓
┌───────────────┐  ┌──────────────────┐  ┌─────────────────┐
│  MainMenu     │  │  ObjectDetection │  │  VoiceSearch    │
│  Screen       │  │  Screen          │  │  Screen         │
└───────────────┘  └──────────────────┘  └─────────────────┘
                             ↓                     ↓
                    ┌─────────────────┐   ┌─────────────────┐
                    │ ObjectDetection │   │  StorageService │
                    │    Service      │   │                 │
                    └─────────────────┘   └─────────────────┘
                             ↓                     ↓
                    ┌─────────────────┐   ┌─────────────────┐
                    │    ItemForm     │   │ SearchResults   │
                    │   Component     │   │    Screen       │
                    └─────────────────┘   └─────────────────┘
                             ↓                     ↓
                    ┌──────────────────────────────────────┐
                    │        AsyncStorage (Persistent)      │
                    └──────────────────────────────────────┘
```

---

## 7. Services & Storage

### 7.1: ObjectDetectionService

**Responsibilities:**
- Initialize TensorFlow.js
- Load COCO-SSD model
- Process images
- Detect objects
- Return predictions

**Methods:**
```typescript
class ObjectDetectionService {
    // Initialize model
    async initialize(): Promise<void>
    
    // Detect from image URI
    async detectObject(imageUri: string): Promise<Detection>
    
    // Get all detections
    async detectObjectsFromImage(imageUri: string): Promise<Detection[]>
    
    // Model status
    isModelReady(): boolean
    getModelInfo(): ModelInfo
    getClassNames(): string[]
}
```

### 7.2: StorageService

**Responsibilities:**
- Save items to AsyncStorage
- Load items from AsyncStorage
- Delete items
- Search items

**Methods:**
```typescript
class StorageService {
    // Save new item
    static async saveItem(item: SavedItem): Promise<void>
    
    // Get all items
    static async getAllItems(): Promise<SavedItem[]>
    
    // Delete item by ID
    static async deleteItem(itemId: string): Promise<void>
    
    // Search items
    static async searchItems(query: string): Promise<SavedItem[]>
}
```

**Storage Structure:**
```json
{
    "@saved_items": [
        {
            "id": "1730123456789",
            "itemName": "bottle",
            "color": "Blue",
            "description": "Water bottle",
            "category": "other",
            "price": "10",
            "quantity": "1",
            "photoUri": "file:///path/to/photo.jpg",
            "timestamp": "2025-10-24T10:30:00.000Z"
        }
    ]
}
```

---

## 8. Complete User Journey Examples

### Example 1: Object Detection Journey

```
1. User opens app
   → App.tsx renders
   → TensorFlow loads
   → MainMenu appears
   
2. User taps "Object Detection"
   → Navigate to ObjectDetectionScreen
   → Request camera permission
   → Camera preview starts
   
3. User points camera at a bottle
   → Camera shows live preview
   → Green frame guides user
   
4. User taps capture button
   → Photo taken
   → Sent to AI model
   → Model detects "bottle" (confidence: 95%)
   
5. Navigate to ItemForm
   → Pre-filled with "bottle"
   → User adds details (color, price, etc.)
   → User taps "Save"
   
6. Item saved
   → Stored in AsyncStorage
   → Success alert shown
   → Navigate back to MainMenu
```

### Example 2: Voice Search Journey

```
1. User opens app
   → MainMenu appears
   
2. User taps "Voice Search"
   → Navigate to VoiceSearchScreen
   → Initialize Voice module
   → Request microphone permission
   
3. User taps "Tap to Speak"
   → Voice recognition starts
   → Microphone listens
   → User says "bottle"
   
4. Speech recognized
   → Text displayed: "bottle"
   → TTS speaks back: "You want to find bottle"
   → Search items in storage
   
5. Results found
   → Navigate to SearchResultsScreen
   → Display all bottle items
   → User can view details
   
6. User deletes an item
   → Confirmation alert
   → Item removed from storage
   → UI updates
```

---

## 9. Key Technical Concepts

### React Hooks Used
- `useState` - Component state management
- `useEffect` - Side effects and lifecycle
- `useRef` - Camera and component references
- `useTranslation` - i18n language support
- `useCameraPermissions` - Camera permission handling

### Navigation Pattern
- **Stack Navigation** - Screen transitions
- **Route Parameters** - Pass data between screens
- **Navigation Methods:**
  - `navigation.navigate('Screen')` - Go to screen
  - `navigation.goBack()` - Return to previous
  - `navigation.replace('Screen')` - Replace current

### Async Operations
- **Camera capture** - `takePictureAsync()`
- **AI detection** - `detectObject(imageUri)`
- **Voice recognition** - `Voice.start(locale)`
- **Storage operations** - `AsyncStorage.getItem()`
- **TTS** - `Tts.speak(message)`

### Error Handling
- Try-catch blocks for async operations
- Alert dialogs for user-facing errors
- Console logging for debugging
- Graceful fallbacks for failures

---

## 10. Performance Optimizations

### Implemented Optimizations
1. **Model caching** - TensorFlow model cached after first download
2. **Lazy loading** - Components loaded only when needed
3. **Image compression** - Photos compressed to 70% quality
4. **Async rendering** - Heavy operations run asynchronously
5. **Memory cleanup** - Voice listeners cleaned up on unmount

### Future Optimizations
1. Implement React.memo for list items
2. Use FlatList virtualization for large lists
3. Add image thumbnail generation
4. Implement pagination for search results
5. Add loading skeletons for better UX

---

## 11. Debugging Tips

### Common Issues & Solutions

**Issue: Model takes long to load**
- First time: Model downloads (~10MB)
- Solution: Show loading indicator
- Cache improves subsequent loads

**Issue: Camera not working**
- Check permissions granted
- Verify camera hardware available
- Restart app if needed

**Issue: Voice recognition fails**
- Check microphone permission
- Ensure internet connection (first time)
- Verify language code correct

**Issue: Items not saving**
- Check AsyncStorage not full
- Verify JSON serialization
- Check for quota errors

---

## 12. Development Workflow

### Code Change → Testing Cycle

```
1. Edit code in VS Code
   ↓
2. Metro bundler detects change
   ↓
3. Fast refresh updates app
   ↓
4. Test on device/emulator
   ↓
5. Check console logs
   ↓
6. Iterate
```

### Build Process

```
Development Build:
npx expo run:android
    ↓
Gradle builds native code
    ↓
Metro bundles JavaScript
    ↓
App installed on device
    ↓
Ready for testing

Production Build:
eas build --platform android
    ↓
Cloud build with optimization
    ↓
APK/AAB generated
    ↓
Ready for distribution
```

---

## 📚 Related Documents

- **README.md** - Installation and setup
- **PROJECT_SUMMARY.md** - Project overview
- **IMPLEMENTATION_GUIDE.md** - AI implementation details
- **QUICKSTART.md** - Quick start guide

---

**Last Updated:** October 24, 2025
**Version:** 1.0.0
**Status:** ✅ Complete and Updated

