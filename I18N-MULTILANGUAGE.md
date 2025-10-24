# Multi-Language Support (i18n) - Implementation Guide

## 🌍 **Features Implemented**

### ✅ **Auto Language Detection**
- Detects device language automatically
- Supports **Vietnamese (VI)** and **English (EN)**
- Falls back to Vietnamese if detection fails

### ✅ **Real-Time Language Switching**
- **Language button** in top-right corner of camera screen
- Toggle between 🇻🇳 VI and 🇬🇧 EN
- Instant UI update (no app restart needed)

### ✅ **Fully Translated**
- **All 80+ object names** (COCO-SSD objects)
- **All UI text** (buttons, labels, messages)
- **All alerts** (low confidence, errors, success)
- **Loading screens** and permissions

---

## 📦 **Dependencies Installed**

```json
{
  "i18next": "^23.x",
  "react-i18next": "^14.x",
  "expo-localization": "~15.x"
}
```

---

## 📁 **File Structure**

```
src/
├── i18n/
│   ├── config.ts           ← i18n initialization
│   └── locales/
│       ├── en.json          ← English translations
│       └── vi.json          ← Vietnamese translations
```

---

## 🎯 **How It Works**

### **1. Auto-Detection**
```typescript
// Device language is detected on app start
const deviceLanguage = Localization.getLocales()[0]?.languageCode;
// App starts in Vietnamese or English based on device
```

### **2. Language Switching**
```typescript
// Tap language button to toggle
🇬🇧 EN ←→ 🇻🇳 VI
```

### **3. Object Name Translation**
```typescript
// English from AI model
AI detects: "cell phone"

// Auto-translated based on current language
Vietnamese: "Điện thoại"
English: "Cell phone"
```

---

## 🔤 **Translation Examples**

### **Object Names:**
| English | Vietnamese |
|---------|------------|
| Cell phone | Điện thoại |
| Laptop | Máy tính xách tay |
| Cup | Cốc |
| Chair | Ghế |
| Car | Xe hơi |

### **UI Text:**
| English | Vietnamese |
|---------|------------|
| Center Object & Capture | Căn Giữa & Chụp |
| Keep within green frame | Giữ trong khung xanh |
| Detecting objects... | Đang nhận diện... |
| Save Item | Lưu Vật Phẩm |
| Low Confidence Detection | Độ Tin Cậy Thấp |

---

## 🎨 **Language Button**

**Location:** Top-right corner of camera screen

**Appearance:**
```
┌─────────────────────────┐
│  🇻🇳 VI  ← Language button
│                          │
│     📸                   │
│  Căn Giữa & Chụp        │
└─────────────────────────┘
```

**Behavior:**
- Shows current **opposite** language
- Tap to switch instantly
- Updates all text immediately

---

## 💻 **Usage in Code**

### **In Components:**
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <Text>{t('camera.title')}</Text>
    // Vietnamese: "Căn Giữa & Chụp"
    // English: "Center Object & Capture"
  );
};
```

### **In Services:**
```typescript
import i18n from '../i18n/config';

const translatedName = i18n.t(`objects.${objectName}`);
// Translates object names from AI model
```

---

## 📝 **Adding New Translations**

### **1. Add to English (`src/i18n/locales/en.json`):**
```json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is new"
  }
}
```

### **2. Add to Vietnamese (`src/i18n/locales/vi.json`):**
```json
{
  "newFeature": {
    "title": "Tính Năng Mới",
    "description": "Đây là mới"
  }
}
```

### **3. Use in Components:**
```typescript
<Text>{t('newFeature.title')}</Text>
```

---

## 🧪 **Testing**

### **Test Language Detection:**
1. **Change device language:**
   - Settings → Language → Vietnamese
   - Restart app → Should show Vietnamese
   
2. **Change to English:**
   - Settings → Language → English
   - Restart app → Should show English

### **Test Language Switcher:**
1. Open app (any language)
2. Tap language button (top-right)
3. UI should switch instantly
4. Detect an object → Name should be in selected language

---

## 🌐 **Supported Languages**

### **Currently Implemented:**
- ✅ **Vietnamese (vi)** - Full support
- ✅ **English (en)** - Full support

### **Easy to Add:**
- 🇨🇳 Chinese (zh)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇹🇭 Thai (th)
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)

**To add a new language:**
1. Create `src/i18n/locales/{language-code}.json`
2. Copy structure from `en.json`
3. Translate all values
4. Add to `config.ts`:
```typescript
resources: {
  en: { translation: en },
  vi: { translation: vi },
  zh: { translation: zh }, // New language
}
```

---

## 📊 **Translation Coverage**

- ✅ **80+ object names** (all COCO-SSD classes)
- ✅ **Camera UI** (title, subtitle, buttons)
- ✅ **Form labels** (item name, color, description, etc.)
- ✅ **Alerts** (low confidence, errors, success)
- ✅ **Loading screens** (initialization, permissions)
- ✅ **Button text** (capture, test, save, cancel)

---

## 🔧 **Configuration**

### **Default Language:**
```typescript
// In src/i18n/config.ts
fallbackLng: 'vi' // Default to Vietnamese
```

### **Change Default:**
```typescript
fallbackLng: 'en' // Change to English
```

---

## ✨ **Benefits**

- ✅ **Better UX** - Users see app in their language
- ✅ **Wider audience** - Supports multiple regions
- ✅ **Auto-detection** - No manual setup needed
- ✅ **Easy switching** - One-tap language change
- ✅ **Scalable** - Easy to add more languages
- ✅ **Professional** - Industry-standard solution

---

## 📚 **Resources**

- **react-i18next:** https://react.i18next.com/
- **i18next:** https://www.i18next.com/
- **expo-localization:** https://docs.expo.dev/versions/latest/sdk/localization/

---

*Implementation Date: October 2025*
*Languages: Vietnamese (VI) • English (EN)*



