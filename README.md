# Object Detection Expo App

This is an Expo-compatible version of the Object Detection app. It uses Expo Camera for capturing images and includes a form interface for managing detected items.

## Features

- 📷 Camera integration using Expo Camera
- 🤖 Object detection service (mock implementation ready for AI model integration)
- 📝 Item form with category selection
- 💾 Support for item details (name, description, price, quantity)
- 📱 Cross-platform support (iOS, Android, Web)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- For iOS: Xcode and CocoaPods (for building standalone app)
- For Android: Android Studio (for building standalone app)

## Installation

1. Navigate to the project directory:
```bash
cd F:\Cursor_Object_Detection_Expo
```

2. Install dependencies:
```bash
npm install
```

## Running the App

### Using Expo Go (Recommended for Development)

1. Start the development server:
```bash
npm start
```

2. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Running on Specific Platforms

```bash
# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on Web
npm run web
```

## Project Structure

```
Cursor_Object_Detection_Expo/
├── App.tsx                          # Main app component with camera
├── src/
│   ├── components/
│   │   └── ItemForm.tsx            # Form for entering item details
│   └── services/
│       └── ObjectDetectionService.ts # Object detection service
├── assets/                          # Images and icons
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
└── README.md                        # This file
```

## Key Differences from React Native CLI Version

1. **Camera Library**: Uses `expo-camera` instead of `react-native-vision-camera`
2. **Permissions**: Uses Expo's built-in permission system
3. **Configuration**: Uses `app.json` instead of native configuration files
4. **No Native Code**: No need to configure Android/iOS native files
5. **Easier Setup**: No need for Android Studio or Xcode for development

## Adding Real Object Detection

To implement real object detection with TensorFlow.js:

1. Install TensorFlow.js:
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
```

2. Install additional dependencies:
```bash
expo install expo-gl expo-gl-cpp expo-camera
```

3. Update `ObjectDetectionService.ts` to load and use a real model:
```typescript
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';

// Load the model
const model = await cocossd.load();

// Detect objects
const predictions = await model.detect(imageElement);
```

## Camera Permissions

The app will automatically request camera permissions when launched. Make sure to allow camera access for the app to function properly.

### iOS
Camera permission is configured in `app.json` under `ios.infoPlist.NSCameraUsageDescription`

### Android
Camera permission is configured in `app.json` under `android.permissions`

## Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

### Using EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure your project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Testing on Expo Go

1. Install Expo Go from:
   - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the development server: `npm start`

3. Scan the QR code with your device

## Troubleshooting

### Camera not working
- Ensure camera permissions are granted
- Check that your device has a camera
- Try restarting the Expo Go app

### Module not found errors
```bash
npm install
npm start --clear
```

### Expo Go compatibility issues
Some packages may not work with Expo Go. Consider using a development build:
```bash
expo install expo-dev-client
expo run:android
# or
expo run:ios
```

## Environment

- **Expo SDK**: Latest
- **React**: 18.2.0
- **React Native**: Latest (via Expo)
- **TypeScript**: Yes

## License

This project is for educational and demonstration purposes.

## 📚 Documentation

For detailed documentation, see the `/documents` folder:

- **[QUICKSTART.md](documents/QUICKSTART.md)** - Quick 3-step guide
- **[PROJECT_SUMMARY.md](documents/PROJECT_SUMMARY.md)** - Project overview
- **[IMPLEMENTATION_GUIDE.md](documents/IMPLEMENTATION_GUIDE.md)** - AI implementation details
- **[CODE_WORKFLOW.md](documents/CODE_WORKFLOW.md)** - Code execution workflow
- **[COCO-SSD-OBJECTS.md](documents/COCO-SSD-OBJECTS.md)** - List of 80 detectable objects
- **[I18N-MULTILANGUAGE.md](documents/I18N-MULTILANGUAGE.md)** - Multi-language support guide
- **[CLEANUP_SUMMARY.md](documents/CLEANUP_SUMMARY.md)** - Project cleanup report

## Support

For issues related to:
- Expo: https://docs.expo.dev/
- React Native: https://reactnative.dev/
- TensorFlow.js: https://www.tensorflow.org/js

## Next Steps

1. Integrate a real object detection model (TensorFlow.js, YOLO, etc.)
2. Add database storage (AsyncStorage, SQLite, or cloud database)
3. Implement image capture and preprocessing
4. Add more detailed item management features
5. Implement user authentication
6. Add cloud storage for images

## Notes

- The current implementation uses a mock object detection service
- Camera capture functionality is simplified for demo purposes
- Form validation is basic and should be enhanced for production
- Consider adding error boundaries for better error handling
- Implement proper state management (Redux, Context API, etc.) for larger apps

