module.exports = {
    dependencies: {
        '@react-native-async-storage/async-storage': {
            platforms: {
                android: {
                    sourceDir: '../node_modules/@react-native-async-storage/async-storage/android',
                    packageImportPath: 'import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;',
                },
            },
        },
        'react-native-fs': {
            platforms: {
                android: {
                    sourceDir: '../node_modules/react-native-fs/android',
                    packageImportPath: 'import com.rnfs.RNFSPackage;',
                },
            },
        },
        'react-native-permissions': {
            platforms: {
                android: {
                    sourceDir: '../node_modules/react-native-permissions/android',
                    packageImportPath: 'import com.zoontek.rnpermissions.RNPermissionsPackage;',
                },
            },
        },
        'react-native-vector-icons': {
            platforms: {
                android: {
                    sourceDir: '../node_modules/react-native-vector-icons/android',
                    packageImportPath: 'import com.oblador.vectoricons.VectorIconsPackage;',
                },
            },
        },
        'react-native-vision-camera': {
            platforms: {
                android: {
                    sourceDir: '../node_modules/react-native-vision-camera/android',
                    packageImportPath: 'import com.mrousavy.camera.CameraPackage;',
                },
            },
        },
    },
};

