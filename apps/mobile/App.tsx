import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { config } from "./src/config";

type Health = { status: string; service: string };

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${config.apiUrl}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHealth(await res.json());
    } catch (e) {
      setHealth(null);
      setError(
        e instanceof Error
          ? e.message
          : "Cannot reach API — use your LAN IP in .env on device"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>yogesh.studio</Text>
      <Text style={styles.subtitle}>Mobile broadcaster · Phase 2</Text>

      {loading ? (
        <ActivityIndicator color="#8b5cf6" style={styles.loader} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>API</Text>
          <Text style={health ? styles.ok : styles.bad}>
            {health ? health.status : "offline"}
          </Text>
          <Text style={styles.meta}>LiveKit: {config.livekitUrl}</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={() => void refresh()}>
        <Text style={styles.buttonText}>Refresh</Text>
      </Pressable>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f12",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  brand: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fafafa",
  },
  subtitle: {
    marginTop: 8,
    color: "#a1a1aa",
    fontSize: 14,
  },
  loader: { marginTop: 32 },
  card: {
    marginTop: 32,
    width: "100%",
    maxWidth: 320,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  label: { color: "#71717a", fontSize: 12, textTransform: "uppercase" },
  ok: { marginTop: 4, fontSize: 20, fontWeight: "600", color: "#34d399" },
  bad: { marginTop: 4, fontSize: 20, fontWeight: "600", color: "#f87171" },
  meta: { marginTop: 12, color: "#71717a", fontSize: 12 },
  error: {
    marginTop: 16,
    color: "#fca5a5",
    textAlign: "center",
    fontSize: 13,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#7c3aed",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
