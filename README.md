# Object Detection App

A React Native application that uses the phone camera and AI model to detect objects and automatically fill in item forms.

## Features

- 📸 **Camera Integration**: Uses device camera to capture images
- 🤖 **AI Object Detection**: Detects objects using TensorFlow.js
- 📝 **Auto-fill Forms**: Automatically fills item name based on detected objects
- 🎨 **Modern UI**: Clean and intuitive user interface
- 📱 **Cross-platform**: Works on both iOS and Android

## Prerequisites

Before running this app, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **React Native CLI** (`npm install -g react-native-cli`)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Java Development Kit (JDK)** (version 11 or higher)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repository-url>
   cd ObjectDetectionApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (macOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

## Configuration

### Android Setup

1. **Update AndroidManifest.xml** (already configured):
   - Camera permission is already added
   - Internet permission is included

2. **Build configuration**:
   - The app is configured to work with Android API level 21+

### iOS Setup

1. **Update Info.plist** (already configured):
   - Camera usage description is added
   - Photo library access is configured

2. **Build configuration**:
   - The app is configured for iOS 11.0+

## Running the App

### Android

1. **Start Metro bundler**:
   ```bash
   npm start
   ```

2. **Run on Android** (in a new terminal):
   ```bash
   npm run android
   ```

### iOS (macOS only)

1. **Start Metro bundler**:
   ```bash
   npm start
   ```

2. **Run on iOS** (in a new terminal):
   ```bash
   npm run ios
   ```

## Project Structure

```
ObjectDetectionApp/
├── App.tsx                          # Main application component
├── src/
│   ├── components/
│   │   └── ItemForm.tsx            # Item form component
│   └── services/
│       └── ObjectDetectionService.ts # AI model service
├── android/                         # Android-specific files
├── ios/                            # iOS-specific files
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── babel.config.js                 # Babel configuration
├── metro.config.js                 # Metro bundler configuration
└── README.md                       # This file
```

## Code Explanation

### Main App Component (`App.tsx`)

The main application component handles:

- **Camera Permission**: Requests camera access from the user
- **Camera Integration**: Uses `react-native-vision-camera` for camera functionality
- **Object Detection**: Calls the AI service to detect objects
- **Navigation**: Switches between camera view and form view

Key features:
- Permission handling for both iOS and Android
- Camera overlay with capture button
- State management for detected items
- Form navigation

### Item Form Component (`src/components/ItemForm.tsx`)

The form component provides:

- **Auto-fill Functionality**: Automatically fills item name with detected object
- **Form Fields**: Item name, description, category, price, and quantity
- **Category Selection**: Horizontal scrollable category buttons
- **Validation**: Ensures required fields are filled
- **Responsive Design**: Works on different screen sizes

Key features:
- Keyboard-aware scrolling
- Category selection with visual feedback
- Form validation
- Auto-fill indication

### Object Detection Service (`src/services/ObjectDetectionService.ts`)

The AI service handles:

- **TensorFlow.js Integration**: Initializes TensorFlow.js for React Native
- **Object Detection**: Processes images and returns detected objects
- **Model Management**: Handles AI model loading and inference
- **Error Handling**: Graceful error handling for AI operations

Key features:
- COCO dataset class names (80 common objects)
- Mock implementation for demonstration
- Extensible for real model integration
- Async/await pattern for better performance

## Dependencies

### Core Dependencies

- **React Native**: Cross-platform mobile framework
- **TypeScript**: Type-safe JavaScript
- **react-native-vision-camera**: Camera functionality
- **@tensorflow/tfjs**: AI/ML framework
- **react-native-permissions**: Permission handling

### Development Dependencies

- **Metro**: React Native bundler
- **Babel**: JavaScript transpiler
- **ESLint**: Code linting
- **Jest**: Testing framework

## Customization

### Adding Real AI Model

To integrate a real AI model:

1. **Download a pre-trained model** (e.g., MobileNet, YOLO)
2. **Convert to TensorFlow.js format**
3. **Update ObjectDetectionService.ts**:
   ```typescript
   static async loadRealModel(): Promise<void> {
     this.model = await tf.loadLayersModel('path/to/your/model.json');
   }
   ```

### Customizing Object Classes

To detect different objects:

1. **Update class names** in `ObjectDetectionService.ts`
2. **Modify the classNames array** with your specific objects
3. **Retrain or use appropriate model** for your use case

### Styling Changes

The app uses StyleSheet for styling. Key style files:
- `App.tsx`: Camera view styles
- `ItemForm.tsx`: Form component styles

## Troubleshooting

### Common Issues

1. **Camera Permission Denied**:
   - Check device settings
   - Ensure permissions are properly configured in manifest/plist

2. **Metro Bundler Issues**:
   ```bash
   npx react-native start --reset-cache
   ```

3. **Build Failures**:
   - Clean build folders:
     ```bash
     # Android
     cd android && ./gradlew clean && cd ..
     
     # iOS
     cd ios && xcodebuild clean && cd ..
     ```

4. **TensorFlow.js Issues**:
   - Ensure proper initialization
   - Check model compatibility

### Performance Optimization

- **Image Resolution**: Reduce image size for faster processing
- **Model Size**: Use lightweight models for mobile devices
- **Caching**: Implement model caching for better performance

## Future Enhancements

- [ ] Real AI model integration
- [ ] Offline model support
- [ ] Multiple object detection
- [ ] Confidence score display
- [ ] Image gallery integration
- [ ] Cloud storage integration
- [ ] User authentication
- [ ] Item history tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review React Native documentation

---

**Note**: This is a demonstration app with mock AI detection. For production use, integrate with a real AI model and add proper error handling and validation.
