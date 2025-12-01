import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { paperDarkTheme, paperLightTheme } from "./src/theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  const scheme = useColorScheme();
  const paperTheme = scheme === "dark" ? paperDarkTheme : paperLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <StatusBar style={scheme === "dark" ? "light" : "dark"} />
          <RootNavigator />
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
