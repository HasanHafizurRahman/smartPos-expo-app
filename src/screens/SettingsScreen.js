import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import useCompanyConfig from "../hooks/useCompanyConfig";
import Svg, { Path } from "react-native-svg";

const BackIcon = ({ size = 20, color = "#111827" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const UploadIcon = ({ size = 18, color = "#2563EB" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </Svg>
);

export default function SettingsScreen() {
  const navigation = useNavigation();
  const {
    configData,
    logoUrl,
    faviconUrl,
    configDataLoading,
    fetchConfigGrid,
    updateLogo,
    updateFavicon,
    updateConfigData,
    imageHeaders,
  } = useCompanyConfig();

  // Local state for editing the configuration grid
  const [localGrid, setLocalGrid] = useState([]);
  const [logoUriInput, setLogoUriInput] = useState("");
  const [faviconUriInput, setFaviconUriInput] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFav, setUploadingFav] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchConfigGrid();
  }, [fetchConfigGrid]);

  useEffect(() => {
    if (configData) {
      setLocalGrid(JSON.parse(JSON.stringify(configData))); // deep copy
    }
  }, [configData]);

  const handleConfigChange = (index, value) => {
    const updated = [...localGrid];
    updated[index].configurationValue = String(value);
    setLocalGrid(updated);
    setSaveSuccess(false);
  };

  const handleSaveGrid = async () => {
    const payload = localGrid.map((item) => ({
      id: item.id,
      configurationKey: item.configurationKey,
      configurationValue: item.configurationValue,
      configurationValueType: item.configurationValueType,
      isConfigDataUpdatable: item.isConfigDataUpdatable,
    }));

    const success = await updateConfigData(payload);
    if (success) {
      setSaveSuccess(true);
      Alert.alert("Success", "Configuration settings saved successfully.");
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      Alert.alert("Error", "Failed to update configuration settings.");
    }
  };

  const handleLogoUpload = async () => {
    if (!logoUriInput.trim()) {
      Alert.alert("Warning", "Please enter a valid image file URI or URL first.");
      return;
    }
    setUploadingLogo(true);
    const success = await updateLogo(logoUriInput.trim());
    setUploadingLogo(false);
    if (success) {
      Alert.alert("Success", "Company logo updated successfully!");
      setLogoUriInput("");
    } else {
      Alert.alert("Error", "Failed to upload logo.");
    }
  };

  const handleFaviconUpload = async () => {
    if (!faviconUriInput.trim()) {
      Alert.alert("Warning", "Please enter a valid favicon file URI first.");
      return;
    }
    setUploadingFav(true);
    const success = await updateFavicon(faviconUriInput.trim());
    setUploadingFav(false);
    if (success) {
      Alert.alert("Success", "Favicon updated successfully!");
      setFaviconUriInput("");
    } else {
      Alert.alert("Error", "Failed to upload favicon.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FCFC" />

      {/* Premium Screen Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={() => navigation.goBack()}
        >
          <BackIcon size={20} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>System Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Branding Assets Panel */}
        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>Enterprise Branding</Text>

          {/* Logo Section */}
          <View style={styles.brandingRow}>
            <View style={styles.imageBox}>
              <Text style={styles.imageBoxLabel}>Logo Preview</Text>
              {logoUrl ? (
                <Image
                  source={{ uri: logoUrl, headers: imageHeaders }}
                  style={styles.brandingImage}
                  resizeMode="contain"
                  onError={() => console.log("Failed to load logo source")}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>No Logo</Text>
                </View>
              )}
            </View>

            <View style={styles.uploadControls}>
              <Text style={styles.controlLabel}>Upload Logo URI</Text>
              <TextInput
                style={styles.textInput}
                placeholder="file://path/to/logo.png"
                value={logoUriInput}
                onChangeText={setLogoUriInput}
                autoCapitalize="none"
              />
              <Pressable
                style={({ pressed }) => [
                  styles.uploadBtn,
                  pressed && styles.uploadBtnPressed,
                  uploadingLogo && styles.uploadBtnDisabled,
                ]}
                onPress={handleLogoUpload}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <UploadIcon size={14} color="#ffffff" />
                    <Text style={styles.uploadBtnText}>Upload Logo</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* Favicon Section */}
          <View style={[styles.brandingRow, { borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 16, marginTop: 16 }]}>
            <View style={styles.imageBox}>
              <Text style={styles.imageBoxLabel}>Favicon Preview</Text>
              {faviconUrl ? (
                <Image
                  source={{ uri: faviconUrl, headers: imageHeaders }}
                  style={styles.brandingImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>No Icon</Text>
                </View>
              )}
            </View>

            <View style={styles.uploadControls}>
              <Text style={styles.controlLabel}>Upload Favicon URI</Text>
              <TextInput
                style={styles.textInput}
                placeholder="file://path/to/favicon.ico"
                value={faviconUriInput}
                onChangeText={setFaviconUriInput}
                autoCapitalize="none"
              />
              <Pressable
                style={({ pressed }) => [
                  styles.uploadBtn,
                  pressed && styles.uploadBtnPressed,
                  uploadingFav && styles.uploadBtnDisabled,
                ]}
                onPress={handleFaviconUpload}
                disabled={uploadingFav}
              >
                {uploadingFav ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <UploadIcon size={14} color="#ffffff" />
                    <Text style={styles.uploadBtnText}>Upload Favicon</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        {/* Configurations Settings Grid Panel */}
        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>Configuration Records</Text>

          {configDataLoading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 30 }} />
          ) : localGrid.length > 0 ? (
            localGrid.map((item, index) => {
              const isBool = item.configurationValueType === "Boolean";
              return (
                <View key={item.id} style={styles.configItemRow}>
                  <View style={styles.configMeta}>
                    <Text style={styles.configName}>{item.configurationName}</Text>
                    <Text style={styles.configKey}>{item.configurationKey}</Text>
                  </View>
                  <View style={styles.configControl}>
                    {isBool ? (
                      <Switch
                        value={item.configurationValue === "true"}
                        onValueChange={(val) => handleConfigChange(index, val ? "true" : "false")}
                        thumbColor={item.configurationValue === "true" ? "#2563EB" : "#D1D5DB"}
                        trackColor={{ true: "#93C5FD", false: "#E5E7EB" }}
                        disabled={!item.isConfigDataUpdatable}
                      />
                    ) : (
                      <TextInput
                        style={[styles.gridTextInput, !item.isConfigDataUpdatable && styles.disabledInput]}
                        value={item.configurationValue}
                        onChangeText={(txt) => handleConfigChange(index, txt)}
                        editable={item.isConfigDataUpdatable}
                      />
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No configuration parameters available.</Text>
          )}

          {localGrid.length > 0 && (
            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
              onPress={handleSaveGrid}
            >
              <Text style={styles.saveBtnText}>Save Configurations</Text>
            </Pressable>
          )}

          {saveSuccess && (
            <View style={styles.successNotification}>
              <Text style={styles.successText}>Settings saved in database!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FCFC",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnPressed: {
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  panelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1F2937",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
  },
  brandingRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  imageBox: {
    alignItems: "center",
    width: 90,
  },
  imageBoxLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#9CA3AF",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  brandingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  placeholderText: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  uploadControls: {
    flex: 1,
    justifyContent: "center",
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4B5563",
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderWidth: 1.5,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#111827",
    marginBottom: 8,
  },
  uploadBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  uploadBtnPressed: {
    backgroundColor: "#1D4ED8",
  },
  uploadBtnDisabled: {
    opacity: 0.6,
  },
  uploadBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  configItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 14,
  },
  configMeta: {
    flex: 1,
    marginRight: 16,
  },
  configName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  configKey: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  configControl: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  gridTextInput: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 6,
    height: 36,
    width: 120,
    paddingHorizontal: 10,
    fontSize: 13,
    color: "#111827",
    textAlign: "right",
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
  },
  emptyText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 20,
  },
  saveBtn: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  saveBtnPressed: {
    backgroundColor: "#059669",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  successNotification: {
    marginTop: 12,
    backgroundColor: "#DEF7EC",
    borderColor: "#31C48D",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  successText: {
    color: "#03543F",
    fontSize: 12,
    fontWeight: "600",
  },
});
