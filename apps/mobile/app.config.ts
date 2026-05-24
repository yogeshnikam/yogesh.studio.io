import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "yogesh.studio",
  slug: "yogesh-studio",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0f0f12",
  },
  ios: { supportsTablet: true },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0f0f12",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
  },
  web: { favicon: "./assets/favicon.png" },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000",
    livekitUrl: process.env.EXPO_PUBLIC_LIVEKIT_URL ?? "ws://localhost:7880",
  },
};

export default config;
