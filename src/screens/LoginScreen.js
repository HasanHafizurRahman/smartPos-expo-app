import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
} from "react-native";
import { useDispatch } from "react-redux";
import { loginApi } from "../services/api/authApi";
import { setAuth } from "../store/features/auth/authSlice";

export default function LoginScreen() {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [focusedInput, setFocusedInput] = useState(null); // 'username' | 'password' | null

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please fill in all credentials.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await loginApi(username.trim(), password);
      if (response.success) {
        // According to flow: dispatch(setAuth({ user: null, token: token }))
        // Then profile is loaded in background/App initialization
        dispatch(setAuth({ user: null, token: response.obj }));
      } else {
        setErrorMessage(response.message || "Invalid username or password.");
      }
    } catch (error) {
      console.log("Login error:", error);
      const apiMsg = error.response?.data?.message || error.message;
      setErrorMessage(apiMsg || "Connection failed. Please check backend API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#041625" />
      
      {/* Background Graphic Accents */}
      <View style={styles.topCircle} />
      <View style={styles.bottomCircle} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandContainer}>
          <Image
            source={require("../../assets/smartpos.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>SmartPOS</Text>
          <Text style={styles.brandSubtitle}>Manage operations on the go</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {errorMessage ? (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "username" && styles.inputFocused,
              ]}
              placeholder="Enter your username"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              value={username}
              onChangeText={(txt) => {
                setUsername(txt);
                if (errorMessage) setErrorMessage("");
              }}
              onFocus={() => setFocusedInput("username")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "password" && styles.inputFocused,
              ]}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                if (errorMessage) setErrorMessage("");
              }}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
              loading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Access Terminal</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>© 2026 SmartPOS. All rights reserved.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#041625", // Premium Deep Dark Navy Blue (matches theme.json primary.base)
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 60,
  },
  topCircle: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(37, 99, 235, 0.15)", // Premium Blue Accent translucent circle
  },
  bottomCircle: {
    position: "absolute",
    bottom: -150,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoImage: {
    width: 110,
    height: 110,
    marginBottom: 14,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: "#cbd5e1",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    borderColor: "#fee2e2",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorAlertText: {
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1.5,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111827",
  },
  inputFocused: {
    borderColor: "#2563EB", // Brand Blue active highlight
    backgroundColor: "#ffffff",
  },
  loginButton: {
    backgroundColor: "#2563EB", // Brand Blue primary action
    borderRadius: 8,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonPressed: {
    backgroundColor: "#1D4ED8", // Darker blue on press
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 40,
  },
});
