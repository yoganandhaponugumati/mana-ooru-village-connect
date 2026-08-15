# 🚀 GramMitra — Google Play Store Production & Deployment Guide

This guide provides step-by-step instructions to build, sign, and publish the **GramMitra (Mana Ooru)** Android application to the **Google Play Store**.

---

## 📱 1. Architecture Summary

The GramMitra mobile application (`mana-ooru-mobile`) is built on **Expo React Native** with a high-performance, native-wrapped **WebView** configured specifically for rural resilience:

- **Hardware Back Button Handling**: Device back press navigates backward through web routes rather than closing the app.
- **Offline Recovery UI**: If cellular data drops in a rural area, a polished native screen allows one-tap reconnection.
- **Native Pull-to-Refresh**: Native swipe-down gesture to refresh content.
- **Camera & Storage Permissions**: Enables citizens to capture and upload photos of civic issues directly from the app.
- **Deep Linking**: Configured for both `grammitra://` and `https://grammitra-app.vercel.app`.

---

## 🛠️ 2. Prerequisites

1. **Google Play Developer Account**:
   - Register at [Google Play Console](https://play.google.com/console) ($25 one-time registration fee).
2. **Node.js & EAS CLI**:
   Install the Expo Application Services (EAS) CLI globally:
   ```bash
   npm install -g eas-cli
   ```
3. **Expo Account**:
   Create a free account at [expo.dev](https://expo.dev) and log in:
   ```bash
   eas login
   ```

---

## 📦 3. Building the Production Android App Bundle (.aab)

Google Play Store requires all new apps to be submitted as an **Android App Bundle (`.aab`)** with 64-bit architecture and Target SDK 34+.

### Option A: Cloud Build with EAS (Recommended & Easiest)

1. Navigate to the mobile directory:
   ```bash
   cd mana-ooru-mobile
   ```

2. Configure EAS project ID (first time only):
   ```bash
   eas init
   ```

3. Trigger the production build:
   ```bash
   eas build -p android --profile production
   ```
   > **Note**: EAS will automatically generate and securely store your Android Keystore credentials in the cloud.

4. Once the build finishes (usually 5–10 minutes), download the generated `.aab` file from the link provided in your terminal or from the Expo dashboard.

---

### Option B: Local Android Build (Using Android Studio / Gradle)

If you prefer building locally on your machine with Android Studio:

1. Navigate to the mobile directory:
   ```bash
   cd mana-ooru-mobile
   ```

2. Generate the native Android project:
   ```bash
   npx expo prebuild --platform android
   ```

3. Generate a release Keystore:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore grammitra-release-key.keystore -alias grammitra-key -keyalg RSA -keysize 2048 -validity 10000
   ```

4. Build the release App Bundle:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   The `.aab` will be generated at:
   `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📋 4. Google Play Console Step-by-Step Setup

### Step 1: Create App
1. Go to [Google Play Console](https://play.google.com/console).
2. Click **Create App**.
   - **App name**: `GramMitra`
   - **Default language**: `English (United States)` or `English (India)`
   - **App or game**: `App`
   - **Free or paid**: `Free`
3. Accept the declarations and click **Create App**.

---

### Step 2: Store Listing & Assets

Fill in the Store Listing under **Grow > Store presence > Main store listing**:

| Field | Content / Specification |
|---|---|
| **App name** | GramMitra — Smart Village OS |
| **Short description** | Digital Village OS connecting citizens, workers, trade, notices & AI support. |
| **Full description** | GramMitra (Mana Ooru) is India's dedicated zero-brokerage digital village platform connecting rural communities. <br><br>Features include:<br>• 24h Village Stories & Announcements from Sarpanch/Panchayat officials<br>• Zero-brokerage Agricultural & Goods Marketplace<br>• Local Worker & Labor Hiring Portal<br>• Civic Problem Reporting with Photo & Location Proof<br>• Government Schemes & Welfare Guide<br>• Live Weather Forecasts & AI Village Assistant |
| **App Icon** | `512 x 512 px`, 32-bit PNG with alpha (use `mana-ooru-mobile/assets/icon.png` or `public/pwa-512x512.png`) |
| **Feature Graphic** | `1024 x 500 px`, JPEG or 24-bit PNG (no alpha) |
| **Phone Screenshots** | At least 2 screenshots (`1080 x 1920 px` or `1080 x 2400 px`) |

---

### Step 3: Mandatory Policy & Data Safety Declarations

Google Play enforces strict compliance forms under **Policy > App content**:

#### 1. Privacy Policy
- **URL**: `https://grammitra-app.vercel.app/privacy-policy`

#### 2. Account Deletion URL (Google Play Mandatory since 2024)
- **URL**: `https://grammitra-app.vercel.app/delete-account`
- **Explanation**: Users can delete their account either instantly inside the application or via the verified web deletion form. All personal data is wiped permanently (`ON DELETE CASCADE`).

#### 3. Data Safety Form
Declare the following data types used by GramMitra:

| Data Type | Purpose | Ephemeral / Stored | Shared with 3rd Party? |
|---|---|---|---|
| **Approximate & Precise Location** | Village discovery & weather localization | Stored on profile (editable) | No |
| **Photos & Videos** | Civic problem reporting & marketplace items | Stored securely in Cloud Storage | No |
| **Audio** | Voice input for AI Village Assistant | Processed in real-time | No |
| **Device or other IDs** | Firebase Cloud Messaging (FCM) Push Notifications | Stored for alert delivery | No |
| **Name & Phone Number** | User authentication & marketplace contact | Stored for profile identification | No |

#### 4. App Access
- Select: **"All or some functionality is restricted"**
- Provide test credentials for Google Reviewers:
  - **Username/Email**: `demo.citizen@grammitra.org`
  - **Password**: *(Provide test account credentials)*
  - **Notes**: "App allows guest browsing of marketplace and stories; signing in unlocks problem reporting and posting."

---

### Step 4: Upload Release & Launch

1. Go to **Release > Testing > Closed testing** or **Production**.
2. Click **Create new release**.
3. Upload the `.aab` file generated by EAS or local Gradle build.
4. Name the release: `1.0.0 (1)`.
5. Enter Release Notes:
   ```text
   Initial production release of GramMitra:
   - Village Stories & Official Panchayat Announcements
   - Zero-Brokerage Marketplace & Worker Listings
   - Civic Issue Reporting with photo verification
   - AI Farming & Schemes Assistant
   ```
6. Click **Save** and **Review Release**.
7. Submit for Review!

---

## 🔒 5. Production Security & Performance Checklist

- [x] Strict Row Level Security (RLS) active on all Supabase tables.
- [x] Content Security Policy (CSP) & HSTS enabled in `server.ts` and `vercel.json`.
- [x] Sensitive environment variables kept private on server side.
- [x] Android `allowBackup=false` configured in `app.json`.
- [x] Granular bundle splitting active in `vite.config.ts`.
- [x] PWA Service Worker caching and offline fallback enabled.
- [x] Google Play Privacy Policy and Account Deletion endpoints verified.
