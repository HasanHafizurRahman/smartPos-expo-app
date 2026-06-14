import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useDispatch } from "react-redux";
import { initializeAuth } from "../store/features/auth/authSlice";

export default function LoadingScreen() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0e7c66" />
      <Text style={styles.brand}>Mercato POS</Text>
      <Text style={styles.subtitle}>Securing your session...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f8fb",
  },
  brand: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginTop: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
});
