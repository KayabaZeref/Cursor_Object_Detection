import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as FileSystem from 'expo-file-system/legacy';
import { decode as atob } from 'base-64';
import * as jpeg from 'jpeg-js';
import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import i18n from '../i18n/config';

interface DetectedObject {
    class: string;
    confidence: number;
    bbox?: number[];
}

export interface DetectionResult {
    itemName: string;
    color: string;
    confidence: number;
}

class ObjectDetectionService {
    private static model: cocoSsd.ObjectDetection | null = null;
    private static isInitialized = false;
    private static isTfReady = false;

    /**
     * Initialize TensorFlow.js and load the COCO-SSD model
     */
    static async initialize(): Promise<void> {
        if (this.isInitialized && this.model) {
            console.log('Model already initialized');
            return;
        }

        try {
            console.log('Initializing TensorFlow.js...');

            // Wait for TensorFlow to be ready
            await tf.ready();
            this.isTfReady = true;
            console.log('TensorFlow.js backend:', tf.getBackend());

            // Suppress nonMaxSuppression warning (comes from COCO-SSD library)
            // We already show loading state, so UI blocking is expected
            const originalWarn = console.warn;
            console.warn = (...args: any[]) => {
                if (args[0]?.includes?.('nonMaxSuppression')) return;
                originalWarn(...args);
            };

            // Load the COCO-SSD model (using default mobilenet_v2 for better accuracy)
            console.log('Loading COCO-SSD model (MobileNet v2)...');
            console.log('Checking for cached model or downloading (~5.4MB)...');

            // Add timeout for model loading
            const loadModelWithTimeout = () => {
                return Promise.race([
                    cocoSsd.load({
                        base: 'mobilenet_v2', // Default full version: ~5.4MB, better accuracy
                        modelUrl: undefined, // Use default CDN URL (will be cached by TensorFlow.js)
                    }),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Model loading timeout after 120 seconds.')), 120000)
                    )
                ]);
            };

            this.model = await loadModelWithTimeout();

            this.isInitialized = true;
            console.log('✅ COCO-SSD model loaded successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize TensorFlow.js:', error);
            throw new Error(`TensorFlow initialization failed: ${error}`);
        }
    }

    /**
     * Detect dominant color from image data within a bounding box
     * @param imageData - Raw pixel data (Uint8Array)
     * @param width - Image width
     * @param height - Image height
     * @param bbox - Bounding box [x, y, width, height]
     * @returns Color name
     */
    private static detectDominantColor(
        imageData: Uint8Array,
        width: number,
        height: number,
        bbox?: number[]
    ): string {
        // Use the center 60% of the bounding box to avoid edges
        let [x, y, w, h] = bbox || [
            Math.floor(width * 0.25),
            Math.floor(height * 0.25),
            Math.floor(width * 0.5),
            Math.floor(height * 0.5),
        ];

        // Crop to center 60% to focus on object, not background/edges
        const xPadding = w * 0.2;
        const yPadding = h * 0.2;
        x = Math.floor(x + xPadding);
        y = Math.floor(y + yPadding);
        w = Math.floor(w * 0.6);
        h = Math.floor(h * 0.6);

        // Collect RGB values
        const pixels: Array<[number, number, number]> = [];

        // Sample pixels in the center region (every 8 pixels for better coverage)
        for (let py = Math.floor(y); py < Math.floor(y + h) && py < height; py += 8) {
            for (let px = Math.floor(x); px < Math.floor(x + w) && px < width; px += 8) {
                const index = (py * width + px) * 3;
                const r = imageData[index];
                const g = imageData[index + 1];
                const b = imageData[index + 2];

                // Skip very dark (shadows) and very bright (highlights) pixels
                const brightness = (r + g + b) / 3;
                if (brightness > 20 && brightness < 240) {
                    pixels.push([r, g, b]);
                }
            }
        }

        if (pixels.length === 0) return 'Unknown';

        // Calculate median instead of mean for better accuracy
        // Median is less affected by outliers (reflections, shadows)
        const rValues = pixels.map(p => p[0]).sort((a, b) => a - b);
        const gValues = pixels.map(p => p[1]).sort((a, b) => a - b);
        const bValues = pixels.map(p => p[2]).sort((a, b) => a - b);

        const mid = Math.floor(pixels.length / 2);
        const r = pixels.length % 2 === 0 ? Math.round((rValues[mid - 1] + rValues[mid]) / 2) : rValues[mid];
        const g = pixels.length % 2 === 0 ? Math.round((gValues[mid - 1] + gValues[mid]) / 2) : gValues[mid];
        const b = pixels.length % 2 === 0 ? Math.round((bValues[mid - 1] + bValues[mid]) / 2) : bValues[mid];

        console.log(`🎨 Sampled ${pixels.length} pixels from center region`);

        // Determine color name based on RGB values
        return this.rgbToColorName(r, g, b);
    }

    /**
     * Convert RGB values to a color name with improved accuracy
     */
    private static rgbToColorName(r: number, g: number, b: number): string {
        console.log(`🎨 Analyzing RGB: R=${r}, G=${g}, B=${b}`);

        // Calculate HSV values for better color classification
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        // Brightness (Value in HSV)
        const brightness = max;

        // Saturation
        const saturation = max === 0 ? 0 : delta / max;

        // Hue calculation
        let hue = 0;
        if (delta !== 0) {
            if (max === r) {
                hue = 60 * (((g - b) / delta) % 6);
            } else if (max === g) {
                hue = 60 * (((b - r) / delta) + 2);
            } else {
                hue = 60 * (((r - g) / delta) + 4);
            }
        }
        if (hue < 0) hue += 360;

        console.log(`   HSV: H=${hue.toFixed(1)}°, S=${(saturation * 100).toFixed(1)}%, V=${(brightness / 255 * 100).toFixed(1)}%`);

        // Check for grayscale colors (low saturation)
        if (saturation < 0.20) {
            if (brightness < 60) return 'Black';
            if (brightness < 120) return 'Dark Gray';
            if (brightness < 180) return 'Gray';
            if (brightness < 230) return 'Light Gray';
            return 'White';
        }

        // Use HSV hue for accurate color classification
        // Hue ranges (in degrees):
        // Red: 0-15, 345-360
        // Orange: 15-45
        // Yellow: 45-75
        // Green: 75-165
        // Cyan: 165-195
        // Blue: 195-255
        // Purple/Magenta: 255-345

        // Brown (low saturation orange/red with low brightness)
        if ((hue >= 0 && hue < 45) && brightness < 120 && saturation > 0.3) {
            return 'Brown';
        }

        // Color determination based on hue
        if (hue >= 345 || hue < 15) {
            return brightness > 200 && saturation < 0.5 ? 'Pink' : 'Red';
        } else if (hue >= 15 && hue < 45) {
            return brightness > 180 ? 'Orange' : 'Dark Orange';
        } else if (hue >= 45 && hue < 75) {
            return 'Yellow';
        } else if (hue >= 75 && hue < 165) {
            // Green range - most accurate!
            if (hue < 90) return 'Yellow-Green';
            if (hue < 120) return brightness > 180 ? 'Light Green' : 'Green';
            return 'Dark Green';
        } else if (hue >= 165 && hue < 195) {
            return 'Cyan';
        } else if (hue >= 195 && hue < 255) {
            return brightness > 180 ? 'Light Blue' : 'Blue';
        } else if (hue >= 255 && hue < 285) {
            return 'Purple';
        } else if (hue >= 285 && hue < 315) {
            return 'Magenta';
        } else {
            return 'Pink';
        }
    }

    /**
     * Detect objects in an image from URI
     * @param imageUri - The URI of the image to process
     * @param isCamera - Whether this is from camera (lower threshold for poor camera quality)
     * @returns Detection result with item name and color
     */
    static async detectObject(imageUri: string, isCamera: boolean = false): Promise<DetectionResult> {
        if (!this.isInitialized || !this.model) {
            console.log('Model not initialized, initializing now...');
            await this.initialize();
        }

        try {
            console.log('Processing image for object detection and color analysis...');
            console.log(`Image source: ${isCamera ? 'Camera (lower threshold)' : 'File/Test'}`);

            // MAXIMUM QUALITY: Resize to large dimensions for best detection accuracy
            // This prioritizes accuracy over speed
            console.log('⚡ Processing image at MAXIMUM quality for best detection...');
            const resizedImage = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ resize: { width: 1600 } }], // Large size (1600px) for maximum detail
                { compress: 1.0, format: ImageManipulator.SaveFormat.JPEG } // No compression - maximum quality
            );
            console.log(`✅ Image prepared at MAXIMUM quality`);

            // Read the RESIZED image file (much smaller now!)
            const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Convert to array buffer
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Decode the JPEG to get pixel data (now much faster!)
            console.log('📸 Decoding JPEG...');
            const startDecode = Date.now();
            const decoded = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: false });
            const decodeTime = Date.now() - startDecode;
            console.log(`✅ JPEG decoded in ${decodeTime}ms: ${decoded.width}x${decoded.height}`);

            // Detect objects using the RESIZED image
            const detections = await this.detectObjectsFromImage(resizedImage.uri, isCamera);

            if (detections.length === 0) {
                console.log('⚠️ No objects detected with sufficient confidence.');
                return {
                    itemName: i18n.t('objects.Unknown'),
                    color: i18n.t('colors.Unknown'),
                    confidence: 0
                };
            }

            // Get the top detection
            const topDetection = detections[0];
            const confidencePercent = (topDetection.confidence * 100).toFixed(1);
            console.log(`✅ Detected: ${topDetection.class} (${confidencePercent}% confidence)`);

            // Warn if confidence is low
            if (topDetection.confidence < 0.4) {
                console.log(`⚠️ Low confidence (${confidencePercent}%). Recommend recapture.`);
            }

            // Detect color from the bounding box region
            const detectedColorEnglish = this.detectDominantColor(
                decoded.data,
                decoded.width,
                decoded.height,
                topDetection.bbox
            );
            console.log(`🎨 Detected color (English): ${detectedColorEnglish}`);

            // Translate color name using i18n
            const translatedColor = i18n.t(`colors.${detectedColorEnglish}`, { defaultValue: detectedColorEnglish });
            console.log(`🎨 Translated color (${i18n.language}): ${translatedColor}`);

            // Translate object name using i18n
            const translatedName = i18n.t(`objects.${topDetection.class}`, { defaultValue: topDetection.class });
            console.log(`🌏 Translated (${i18n.language}): ${topDetection.class} → ${translatedName}`);

            return {
                itemName: translatedName,
                color: translatedColor,
                confidence: topDetection.confidence
            };
        } catch (error) {
            console.error('Object detection failed:', error);
            return {
                itemName: i18n.t('objects.Detection failed'),
                color: i18n.t('colors.Unknown'),
                confidence: 0
            };
        }
    }

    /**
     * Detect multiple objects in an image with confidence scores
     * @param imageUri - The URI of the image to process
     * @param isCamera - Whether this is from camera (uses lower threshold)
     * @returns Array of detected objects with confidence scores
     */
    static async detectObjectsFromImage(imageUri: string, isCamera: boolean = false): Promise<DetectedObject[]> {
        if (!this.isInitialized || !this.model) {
            await this.initialize();
        }

        if (!this.model) {
            throw new Error('Model failed to load');
        }

        try {
            console.log('Loading image:', imageUri);

            // Read the image file
            const base64 = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log('Image loaded as base64, length:', base64.length);

            // Convert to array buffer properly
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            console.log('Converted to bytes, size:', bytes.length);

            // Check for valid JPEG header (SOI marker: 0xFF 0xD8)
            if (bytes.length < 2) {
                throw new Error('Image data too small - not a valid JPEG');
            }

            const firstByte = bytes[0].toString(16).padStart(2, '0').toUpperCase();
            const secondByte = bytes[1].toString(16).padStart(2, '0').toUpperCase();
            console.log('First bytes (should be FF D8):', firstByte, secondByte);

            if (firstByte !== 'FF' || secondByte !== 'D8') {
                throw new Error(`Invalid JPEG header: ${firstByte} ${secondByte} - Expected FF D8 (SOI marker)`);
            }

            // Decode the JPEG
            let decoded;
            try {
                decoded = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: false });
            } catch (jpegError) {
                console.error('JPEG decode error:', jpegError);
                throw new Error(`Failed to decode JPEG: ${jpegError instanceof Error ? jpegError.message : String(jpegError)}`);
            }

            console.log('JPEG decoded:', decoded.width, 'x', decoded.height);
            console.log('Decoded data type:', decoded.data.constructor.name);
            console.log('Decoded data length:', decoded.data.length);

            // Create tensor from decoded image data
            // COCO-SSD model expects pixel values in range [0, 255]
            let imageTensor = tf.tensor3d(decoded.data, [decoded.height, decoded.width, 3]);

            // Keep large tensor size for maximum AI detection accuracy
            let processedTensor = imageTensor;
            const targetSize = 800; // Large tensor size for maximum detection accuracy

            if (decoded.width > targetSize || decoded.height > targetSize) {
                const scale = targetSize / Math.max(decoded.width, decoded.height);
                const newWidth = Math.round(decoded.width * scale);
                const newHeight = Math.round(decoded.height * scale);

                console.log(`Resizing from ${decoded.width}x${decoded.height} to ${newWidth}x${newHeight}`);

                // Resize the image
                const expandedTensor = imageTensor.expandDims(0) as tf.Tensor4D;
                const resizedFloat = tf.image.resizeBilinear(expandedTensor, [newHeight, newWidth]);
                const squeezed = resizedFloat.squeeze([0]) as tf.Tensor3D;

                // Convert back to int32 as resizeBilinear returns float32
                processedTensor = squeezed.toInt() as tf.Tensor3D;

                // Clean up intermediate tensors
                expandedTensor.dispose();
                resizedFloat.dispose();
                squeezed.dispose();
                imageTensor.dispose();
            }

            // Run inference with balanced threshold
            // Lower threshold to allow more detections with high-quality images
            const threshold = isCamera ? 0.15 : 0.25; // 15% for camera, 25% for test images
            const thresholdPercent = (threshold * 100).toFixed(0);

            console.log('Running COCO-SSD inference on tensor shape:', processedTensor.shape);
            console.log('Tensor min/max values:',
                tf.min(processedTensor).dataSync()[0],
                tf.max(processedTensor).dataSync()[0]
            );
            console.log(`Using ${thresholdPercent}% confidence threshold (${isCamera ? 'camera' : 'test image'})`);

            const predictions = await this.model.detect(processedTensor, 20, threshold);

            console.log('Raw predictions from model:', JSON.stringify(predictions, null, 2));
            console.log(`Found ${predictions.length} predictions above ${thresholdPercent}% confidence`);

            // Clean up tensors
            processedTensor.dispose();

            // Sort by confidence (highest first)
            const results: DetectedObject[] = predictions
                .map(prediction => ({
                    class: prediction.class,
                    confidence: prediction.score,
                    bbox: prediction.bbox,
                }))
                .sort((a, b) => b.confidence - a.confidence);

            console.log(`Detected ${results.length} object(s):`,
                results.map(r => `${r.class} (${(r.confidence * 100).toFixed(1)}%)`).join(', ')
            );

            return results;
        } catch (error) {
            console.error('Image object detection failed:', error);
            throw error;
        }
    }


    /**
     * Get list of object classes that the model can detect (COCO dataset)
     */
    static getClassNames(): string[] {
        return [
            'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
            'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
            'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
            'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
            'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
            'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
            'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
            'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
            'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
            'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
            'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
            'toothbrush'
        ];
    }

    /**
     * Check if the service is initialized
     */
    static isModelReady(): boolean {
        return this.isInitialized && this.model !== null;
    }

    /**
     * Get model information
     */
    static getModelInfo(): { name: string; backend: string; ready: boolean } {
        return {
            name: 'COCO-SSD (MobileNet v2)',
            backend: this.isTfReady ? tf.getBackend() : 'not initialized',
            ready: this.isModelReady(),
        };
    }

    /**
     * Test detection with a sample image URL
     * Downloads an image and tests object detection
     */
    static async testWithSampleImage(): Promise<DetectionResult> {
        if (!this.isInitialized || !this.model) {
            await this.initialize();
        }

        try {
            console.log('🧪 Testing with sample chair image from internet...');

            // Use a direct image URL that doesn't redirect
            // This is a simple chair image from a reliable CDN
            // const testImageUrl = 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=640&q=80';
            const testImageUrl = 'https://images.unsplash.com/photo-1533776992670-a72f4c28235e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=930';

            console.log('Downloading test image from:', testImageUrl);

            const downloadedFile = await FileSystem.downloadAsync(
                testImageUrl,
                FileSystem.cacheDirectory + 'test_chair.jpg',
                {
                    headers: {
                        'Accept': 'image/jpeg,image/*'
                    }
                }
            );

            console.log('Downloaded test image to:', downloadedFile.uri);
            console.log('Download status:', downloadedFile.status);
            console.log('Download headers:', downloadedFile.headers);

            if (downloadedFile.status !== 200) {
                throw new Error(`Download failed with status ${downloadedFile.status}`);
            }

            // Detect objects in the test image
            const result = await this.detectObject(downloadedFile.uri);

            console.log('🧪 Test result:', result);
            return result;
        } catch (error) {
            console.error('Test failed:', error);
            return {
                itemName: i18n.t('objects.Test failed'),
                color: i18n.t('colors.Unknown'),
                confidence: 0
            };
        }
    }
}

export default ObjectDetectionService;
