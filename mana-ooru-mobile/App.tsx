import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
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
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewNavigation, WebViewMessageEvent } from "react-native-webview";
import * as WebBrowser from "expo-web-browser";
import { createClient } from "@supabase/supabase-js";

WebBrowser.maybeCompleteAuthSession();

const APP_URL = "https://grammitra-app.vercel.app";
const SUPABASE_URL = "https://ytggaoaehejskxtxjfkz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qNqC7EJ4YndEO1H9nSycGA_RHkEnMo5";
const AUTH_CALLBACK_SCHEME = "grammitra://auth-callback";

const supabaseNative = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

function MainScreen() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<any>(null);
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

  // Handle Native Google OAuth via Chrome Custom Tabs
  const handleNativeGoogleAuth = async () => {
    try {
      const { data, error } = await supabaseNative.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: AUTH_CALLBACK_SCHEME,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        console.warn("Could not generate Google OAuth URL:", error);
        return;
      }

      // Open Chrome Custom Tabs (shares device Google Account)
      const authResult = await WebBrowser.openAuthSessionAsync(
        data.url,
        AUTH_CALLBACK_SCHEME,
      );

      if (authResult.type === "success" && authResult.url) {
        const callbackUrl = authResult.url;
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        // Parse hash fragment: grammitra://auth-callback#access_token=...&refresh_token=...
        if (callbackUrl.includes("#")) {
          const hashPart = callbackUrl.split("#")[1];
          const params = new URLSearchParams(hashPart);
          accessToken = params.get("access_token");
          refreshToken = params.get("refresh_token");
        }

        // Parse query params: grammitra://auth-callback?code=...
        if (!accessToken && callbackUrl.includes("?")) {
          const queryPart = callbackUrl.split("?")[1];
          const params = new URLSearchParams(queryPart);
          accessToken = params.get("access_token");
          refreshToken = params.get("refresh_token");

          const code = params.get("code");
          if (code && !accessToken) {
            const { data: codeData, error: codeError } =
              await supabaseNative.auth.exchangeCodeForSession(code);
            if (!codeError && codeData?.session) {
              accessToken = codeData.session.access_token;
              refreshToken = codeData.session.refresh_token;
            }
          }
        }

        if (accessToken && refreshToken && webViewRef.current) {
          const tokenPayload = JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          // Inject into trusted web application handler
          const bridgeScript = `
            (function() {
              if (typeof window.__handleNativeAuthSession === 'function') {
                window.__handleNativeAuthSession(${tokenPayload}).then(function(success) {
                  if (success && window.location.pathname === '/auth') {
                    window.location.href = '/';
                  }
                });
              }
            })();
            true;
          `;
          webViewRef.current.injectJavaScript(bridgeScript);
        }
      }
    } catch (err) {
      console.error("Native Google OAuth flow error:", err);
    }
  };

  // Safe message listener between WebView and Native shell
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      // Validate trusted origin
      const originUrl = event.nativeEvent.url || "";
      const isTrusted =
        originUrl.startsWith("https://grammitra-app.vercel.app") ||
        originUrl.startsWith("http://localhost") ||
        originUrl.startsWith("http://127.0.0.1");

      if (!isTrusted) return;

      const message = JSON.parse(event.nativeEvent.data);
      if (message?.type === "START_GOOGLE_AUTH") {
        void handleNativeGoogleAuth();
      }
    } catch {
      // Ignore unparseable or irrelevant message frames
    }
  };

  return (
    <View
      style={[
        styles.rootContainer,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0E2317" translucent={true} />

      {hasError ? (
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0E2317"]}
            />
          }
        >
          <View style={styles.errorCard}>
            <View style={styles.errorIconBg}>
              <Text style={styles.errorIcon}>📡</Text>
            </View>
            <Text style={styles.errorTitle}>Connection Problem</Text>
            <Text style={styles.errorDescription}>
              Unable to connect to GramMitra. Please verify your mobile data or Wi-Fi
              connection and tap below to retry.
            </Text>
            {errorMessage ? <Text style={styles.errorDetail}>{errorMessage}</Text> : null}
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleReload}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.webviewWrapper}>
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
            onMessage={handleWebViewMessage}
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
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            geolocationEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            onPermissionRequest={(event) => {
              event.grant(event.resources);
            }}
            cacheEnabled={true}
            cacheMode="LOAD_DEFAULT"
            androidLayerType="hardware"
            overScrollMode="never"
            mixedContentMode="compatibility"
            style={styles.webview}
            userAgent="GramMitraMobileApp/1.0.0 (Android; Mobile)"
          />
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#0E2317", // Matches GramMitra dark green brand color behind status and gesture bars
  },
  webviewWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
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
