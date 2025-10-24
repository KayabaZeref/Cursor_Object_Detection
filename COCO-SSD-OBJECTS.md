# COCO-SSD Detectable Objects

This document lists all 80 objects that the COCO-SSD model can detect in this application.

## 📚 Official Resources

- **GitHub Source Code:** https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts
- **TensorFlow.js COCO-SSD Documentation:** https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd
- **COCO Dataset:** http://cocodataset.org/

---

## ✅ Complete List of 80 Detectable Objects

### 👤 People (1)
1. person

### 🐾 Animals (10)
2. bird
3. cat
4. dog
5. horse
6. sheep
7. cow
8. elephant
9. bear
10. zebra
11. giraffe

### 🚗 Vehicles (8)
12. bicycle
13. car
14. motorcycle
15. airplane
16. bus
17. train
18. truck
19. boat

### 🚦 Outdoor Objects (5)
20. traffic light
21. fire hydrant
22. stop sign
23. parking meter
24. bench

### 🎒 Accessories (5)
25. backpack
26. umbrella
27. handbag
28. tie
29. suitcase

### ⚽ Sports Equipment (10)
30. frisbee
31. skis
32. snowboard
33. sports ball
34. kite
35. baseball bat
36. baseball glove
37. skateboard
38. surfboard
39. tennis racket

### 🍽️ Kitchen & Dining (11)
40. bottle
41. wine glass
42. cup
43. fork
44. knife
45. spoon
46. bowl

### 🍎 Food Items (14)
47. banana
48. apple
49. sandwich
50. orange
51. broccoli
52. carrot
53. hot dog
54. pizza
55. donut
56. cake

### 🪑 Furniture (6)
61. chair
62. couch
63. potted plant
64. bed
65. dining table
66. toilet

### 💻 Electronics (6)
67. tv
68. laptop
69. mouse
70. remote
71. keyboard
72. cell phone

### 🏠 Appliances (5)
73. microwave
74. oven
75. toaster
76. sink
77. refrigerator

### 📖 Home Items (5)
78. book
79. clock
80. vase
81. scissors
82. teddy bear

### 🧴 Personal Items (2)
83. hair drier
84. toothbrush

---

## ❌ Objects NOT Detectable

The following common items **cannot** be detected by COCO-SSD:

### Common Items Missing:
- ❌ **Watch/Wristwatch** (only wall/table "clock" is detectable)
- ❌ Jewelry (rings, necklaces, bracelets, earrings)
- ❌ Most clothing items (shirt, pants, shoes, hat) - only "tie" is detectable
- ❌ Eyeglasses/Sunglasses
- ❌ Wallet/Purse (only "handbag" is detectable)
- ❌ Keys
- ❌ Pen/Pencil (only "scissors" for office supplies)
- ❌ Paper/Documents (only "book")
- ❌ Money/Credit cards
- ❌ Plates (only "bowl")
- ❌ Desk/Dresser (only "dining table")
- ❌ Lamp
- ❌ Picture frame
- ❌ Pillow/Cushion
- ❌ Curtains/Blinds
- ❌ Door/Window
- ❌ Musical instruments
- ❌ Toys (except "teddy bear")
- ❌ Tools (except "scissors")
- ❌ Raw ingredients (flour, sugar, etc.)

---

## 💡 Tips for Best Detection

### ✅ DO:
- Use objects from the 80-class list above
- Ensure good lighting
- Place object within the green frame
- Use simple backgrounds
- Move close to the object
- Keep object centered

### ❌ DON'T:
- Try to detect items not in the list
- Use poor lighting or shadows
- Place multiple objects (detection picks the most prominent)
- Use cluttered backgrounds
- Capture from too far away

---

## 🎯 Detection Confidence

The app uses the following confidence thresholds:

- **Minimum Detection:** 25% confidence
- **Low Confidence Warning:** Below 50% triggers recapture suggestion
- **Good Detection:** 50%+ proceeds automatically to form

---

## 📝 Notes

1. **COCO-SSD Model:** MobileNet v2 (5.4MB)
2. **Training Dataset:** Microsoft COCO (Common Objects in Context)
3. **Object Classes:** 80 categories
4. **Model Type:** Real-time object detection
5. **Accuracy:** Optimized for speed and mobile devices

---

*Last Updated: October 2025*

