import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import LoadingScreen from "../screens/LoadingScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import RolesPermissionsScreen from "../screens/RolesPermissionsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, isInitialized } = useSelector((state) => state.auth);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token === null ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="RolesPermissions" component={RolesPermissionsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
