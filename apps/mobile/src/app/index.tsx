import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useStoresHydrated } from "../hooks/useStoresHydrated";
import { useAppStore } from "../store/appStore";
import { useAuthStore } from "../store/authStore";

export default function Index() {
  const hydrated = useStoresHydrated();
  const user = useAuthStore((s) => s.user);
  const hasCompletedOnboarding = useAppStore(
    (s) => s.hasCompletedOnboarding,
  );

  if (!hydrated) {
    return (
      <View style={styles.boot}>
        <Text style={styles.brand}>Points value</Text>
        <ActivityIndicator size="large" color="#2563eb" style={styles.spinner} />
        <Text style={styles.hint}>Loading…</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/dashboard" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6f7fb",
    paddingHorizontal: 32,
  },
  brand: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 12,
  },
  hint: {
    fontSize: 15,
    color: "#6b7280",
  },
});
