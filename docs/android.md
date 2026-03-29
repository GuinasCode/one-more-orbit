# Android bootstrap

This project now has a Capacitor-based Android wrapper.

## Current status

- Capacitor installed (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`)
- Android platform added under `android/`
- Web build syncs into the Android container with `npx cap sync android`
- Native compilation is currently blocked in this environment because Java is not installed (`java: command not found`)

## Commands

- Build web assets: `npm run build`
- Sync web assets into Android: `npx cap sync android`
- Open Android project in Android Studio: `npx cap open android`
- Attempt debug build from CLI (when Java/Android SDK are available): `cd android && ./gradlew assembleDebug`

## What still needs to be done

- Install Java (JDK) on the build host
- Ensure Android SDK is available/configured
- Produce the first debug APK
- Validate touch UX, fullscreen behavior, orientation, icons, splash, and back-button behavior
- Decide release path for Play Store (`APK` for testing, `AAB` for release)

## Recommended next step

Once Java + Android SDK are available, run:

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

That should be the first checkpoint toward a real installable Android build.
