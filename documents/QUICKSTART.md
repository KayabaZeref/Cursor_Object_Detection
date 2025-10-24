# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Expo Go on Your Phone

**iPhone:**
- Open App Store
- Search for "Expo Go"
- Install the app

**Android:**
- Open Google Play Store
- Search for "Expo Go"
- Install the app

### Step 2: Start the Development Server

Open a terminal in this folder and run:

```bash
npm start
```

You'll see a QR code appear in the terminal.

### Step 3: Scan and Run

**iPhone:**
- Open the Camera app
- Point it at the QR code
- Tap the notification to open in Expo Go

**Android:**
- Open Expo Go app
- Tap "Scan QR code"
- Scan the QR code from your terminal

## 📱 Using the App

1. **Grant Camera Permission**: The app will ask for camera access - tap "Grant Permission"
2. **Point Camera**: Aim your camera at any object
3. **Capture**: Tap the white circle button to detect the object
4. **Fill Form**: Enter details about the detected item
5. **Save**: Tap "Save Item" to store the information

## 🔧 Troubleshooting

### Can't see the QR code?
- Make sure your computer and phone are on the same WiFi network
- Try running `npm start --tunnel` instead

### Camera not working?
- Make sure you granted camera permissions
- Close and reopen the Expo Go app
- Try restarting your phone

### App crashes or won't load?
```bash
# Clear cache and restart
npm start --clear
```

### Metro bundler errors?
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm start
```

## 🌐 Running on Web

Want to test on your computer?

```bash
npm run web
```

Note: Camera features may not work fully on web browsers.

## 📝 Next Steps

- Read the full [README.md](README.md) for more details
- Add real object detection with TensorFlow.js
- Customize the UI and add more features
- Build a standalone app for distribution

## 🎯 Development Tips

1. **Hot Reloading**: Changes you make to the code will automatically update in the app
2. **Shake for Menu**: Shake your phone to open the developer menu
3. **Console Logs**: View logs in the terminal where you ran `npm start`
4. **Debugging**: Press `j` in the terminal to open Chrome DevTools

## 📞 Need Help?

- Expo Documentation: https://docs.expo.dev/
- Expo Forums: https://forums.expo.dev/
- React Native Docs: https://reactnative.dev/

Happy Coding! 🎉

