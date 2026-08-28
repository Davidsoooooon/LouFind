import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';
import { isInternalNavigation, resolvePreviewUrl } from './preview-url';

const previewUrl = resolvePreviewUrl(
  process.env.EXPO_PUBLIC_LOUFIND_URL,
  Constants.expoConfig?.hostUri,
);
const logo = require('./assets/logo.png');

function LoadingScreen() {
  return (
    <View style={styles.loading} accessibilityLabel="Loading LouFind">
      <Image
        source={logo}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="LouFind — SLU Lost and Found"
      />
      <ActivityIndicator size="small" color="#073779" />
      <Text style={styles.subtitle}>
        Connecting to your campus lost &amp; found…
      </Text>
      <Text style={styles.campus}>
        Saint Louis University · Baguio, Philippines
      </Text>
    </View>
  );
}

export default function App() {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  function openExternal(url: string) {
    // Only ordinary web links leave the preview; block arbitrary URI schemes.
    if (/^https:\/\//i.test(url)) void Linking.openURL(url).catch(() => {});
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {!previewUrl || failed ? (
          <View style={styles.error}>
            <Image
              source={logo}
              style={styles.errorLogo}
              resizeMode="contain"
              accessibilityLabel="LouFind"
            />
            <Text style={styles.heading} accessibilityRole="header">
              Let’s reconnect
            </Text>
            <Text style={styles.subtitle}>
              Keep your Mac and iPhone on the same Wi-Fi, with both LouFind
              preview servers running. Allow Local Network access for Expo Go in
              iPhone Settings.
            </Text>
            {previewUrl && (
              <Text style={styles.address} selectable>
                {previewUrl}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                setFailed(false);
                setAttempt((value) => value + 1);
              }}
            >
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
            <Text style={styles.note}>
              Your demo reports stay on this device. They do not sync with your
              Mac.
            </Text>
          </View>
        ) : (
          <WebView
            key={attempt}
            style={styles.webview}
            source={{ uri: previewUrl }}
            startInLoadingState
            renderLoading={LoadingScreen}
            onError={() => setFailed(true)}
            onHttpError={({ nativeEvent }) => {
              if (nativeEvent.statusCode >= 400) setFailed(true);
            }}
            onShouldStartLoadWithRequest={({ url }) => {
              if (isInternalNavigation(url, previewUrl)) return true;
              openExternal(url);
              return false;
            }}
            onOpenWindow={({ nativeEvent }) =>
              openExternal(nativeEvent.targetUrl)
            }
            domStorageEnabled
            cacheEnabled
            allowsBackForwardNavigationGestures
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            applicationNameForUserAgent="LouFindMobile"
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  webview: { flex: 1, backgroundColor: '#ffffff' },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 22,
  },
  logo: { width: 280, maxWidth: '100%', height: 250 },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    color: '#52627a',
  },
  campus: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#073779',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    gap: 18,
  },
  errorLogo: { width: 210, maxWidth: '100%', height: 187 },
  heading: { fontSize: 25, fontWeight: '700', color: '#073779' },
  address: { fontSize: 13, color: '#52627a', textAlign: 'center' },
  button: {
    minHeight: 48,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#073779',
  },
  pressed: { opacity: 0.8 },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
  note: { fontSize: 12, lineHeight: 18, textAlign: 'center', color: '#52627a' },
});
