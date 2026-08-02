import { StyleSheet, SafeAreaView, StatusBar } from "react-native";
import WebView from "react-native-webview";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        source={{ uri: "https://mana-ooru-village.vercel.app" }}
        startInLoadingState={true}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webview: {
    flex: 1,
  },
});
