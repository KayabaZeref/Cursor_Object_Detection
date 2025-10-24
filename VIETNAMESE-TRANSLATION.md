# Vietnamese Translation Feature

This app now displays all detected object names in **Vietnamese (Tiếng Việt)** with proper Vietnamese font support.

## 🌏 Language Support

### Automatic Translation
All 80 COCO-SSD detectable objects are automatically translated from English to Vietnamese:

| English | Vietnamese |
|---------|------------|
| **Electronics** ||
| Cell phone | Điện thoại |
| Laptop | Máy tính xách tay |
| Mouse | Chuột máy tính |
| Keyboard | Bàn phím |
| Remote | Điều khiển từ xa |
| TV | Tivi |
| **Kitchen** ||
| Cup | Cốc |
| Bowl | Bát |
| Bottle | Chai |
| Fork | Nĩa |
| Knife | Dao |
| Spoon | Thìa |
| **Furniture** ||
| Chair | Ghế |
| Couch | Ghế sofa |
| Bed | Giường |
| Table | Bàn ăn |
| **Food** ||
| Apple | Táo |
| Banana | Chuối |
| Orange | Cam |
| Pizza | Pizza |
| Cake | Bánh ngọt |
| **Vehicles** ||
| Car | Xe hơi |
| Bicycle | Xe đạp |
| Motorcycle | Xe máy |
| Bus | Xe buýt |
| Train | Tàu hóa |
| **Animals** ||
| Cat | Mèo |
| Dog | Chó |
| Bird | Chim |
| Horse | Ngựa |
| Cow | Bò |

### Complete Translation List
See `src/services/VietnameseTranslation.ts` for all 80+ translations.

---

## 🎨 Font Support

### Vietnamese Characters Supported:
- ✅ **Tones:** à, á, ả, ã, ạ, ă, ằ, ắ, ẳ, ẵ, ặ, â, ầ, ấ, ẩ, ẫ, ậ
- ✅ **Special Letters:** đ, ê, ô, ơ, ư
- ✅ **All diacritics** properly rendered

### System Fonts
- **Android:** Roboto (supports Vietnamese)
- **iOS:** San Francisco (supports Vietnamese)
- **Web:** System default fonts

No additional font installation required! ✅

---

## 📱 User Experience

### What Users See:

**Detection:**
```
English: "Cell phone"
Vietnamese: "Điện thoại"
```

**Form Display:**
```
Item Name: Điện thoại
Color: Green
```

**Console Logs:**
```
✅ Detected: cell phone (87.5% confidence)
🌏 Translated: cell phone → Điện thoại
```

---

## 🔧 Technical Implementation

### Translation Service
File: `src/services/VietnameseTranslation.ts`

```typescript
import { translateToVietnamese } from './VietnameseTranslation';

// Usage
const vietnamese = translateToVietnamese('cell phone');
// Returns: "Điện thoại"
```

### Functions Available:
- `translateToVietnamese(englishName)` - Translate to Vietnamese
- `getAllTranslations()` - Get all translations
- `hasTranslation(englishName)` - Check if translation exists

---

## 📝 Adding New Translations

To add or modify translations, edit:
```
src/services/VietnameseTranslation.ts
```

Add entries to the `vietnameseTranslations` object:
```typescript
export const vietnameseTranslations: { [key: string]: string } = {
    'new object': 'Tên tiếng Việt',
    // ... more translations
};
```

---

## ✅ Testing

### Test Object Detection:
1. Launch app on phone
2. Point camera at object
3. Press capture
4. **Expected:** Vietnamese name appears in form

### Test Examples:
- Phone → **Điện thoại** ✅
- Laptop → **Máy tính xách tay** ✅
- Cup → **Cốc** ✅
- Chair → **Ghế** ✅
- Car → **Xe hơi** ✅

---

## 🌐 Future Enhancements

### Potential Additions:
- [ ] Add more languages (English, Chinese, etc.)
- [ ] User-selectable language in settings
- [ ] Color names in Vietnamese
- [ ] UI text translation
- [ ] Multi-language documentation

---

## 📚 Resources

- **Vietnamese Unicode:** [Unicode.org](https://unicode.org/charts/PDF/U1EA0.pdf)
- **COCO Dataset:** [cocodataset.org](http://cocodataset.org/)
- **TensorFlow.js:** [tensorflow.org/js](https://www.tensorflow.org/js)

---

*Created: October 2025*
*Language: Tiếng Việt (Vietnamese)*

