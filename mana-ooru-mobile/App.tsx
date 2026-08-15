import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
  RefreshControl,
  ScrollView,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

const APP_URL = "https://grammitra-app.vercel.app";

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Handle Android Hardware Back Button
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Prevent app exit
      }
      return false; // Allow app exit if at root
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setIsLoading(navState.loading);
  };

  const handleReload = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleReload();
    setTimeout(() => setRefreshing(false), 1200);
  }, [handleReload]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E2317" />

      {hasError ? (
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0E2317"]} />}
        >
          <View style={styles.errorCard}>
            <View style={styles.errorIconBg}>
              <Text style={styles.errorIcon}>📡</Text>
            </View>
            <Text style={styles.errorTitle}>Connection Problem</Text>
            <Text style={styles.errorDescription}>
              Unable to connect to GramMitra. Please verify your mobile data or Wi-Fi connection and tap below to retry.
            </Text>
            {errorMessage ? <Text style={styles.errorDetail}>{errorMessage}</Text> : null}
            <TouchableOpacity style={styles.retryButton} onPress={handleReload} activeOpacity={0.8}>
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.webviewContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: APP_URL }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#0E2317" />
                <Text style={styles.loadingText}>Loading GramMitra...</Text>
              </View>
            )}
            onNavigationStateChange={handleNavigationStateChange}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              setHasError(true);
              setErrorMessage(nativeEvent.description || "Network connection failed");
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              if (nativeEvent.statusCode >= 500) {
                setHasError(true);
                setErrorMessage(`Server error (${nativeEvent.statusCode})`);
              }
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            geolocationEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            onPermissionRequest={(event) => {
              // Automatically delegate web permission requests (Camera, Microphone, etc.) to Android native permission dialogs
              event.grant(event.resources);
            }}
            cacheEnabled={true}
            mixedContentMode="compatibility"
            style={styles.webview}
            userAgent="GramMitraMobileApp/1.0.0 (Android; Mobile)"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E2317",
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFDF9",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#0E2317",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  errorIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 30,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  errorDetail: {
    fontSize: 11,
    fontFamily: Platform.OS === "android" ? "monospace" : "Menlo",
    color: "#EF4444",
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 8,
    marginBottom: 18,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0E2317",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
