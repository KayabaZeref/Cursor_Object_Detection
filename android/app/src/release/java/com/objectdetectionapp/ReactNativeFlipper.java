package com.objectdetectionapp;

import android.content.Context;
import com.facebook.react.ReactInstanceManager;

/**
 * Class responsible for loading Flipper inside your React Native application. This is the release
 * flavor of Application so that you can build a release version of your app using the release
 * build variant.
 */
public class ReactNativeFlipper {
  public static void initializeFlipper(Context context, ReactInstanceManager reactInstanceManager) {
    // Do nothing as we don't want to initialize Flipper on Release.
  }
}
