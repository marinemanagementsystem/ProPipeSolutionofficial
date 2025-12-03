import React from "react";
import { useColorScheme, View } from "react-native";
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Text } from "react-native-paper";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import ProjectsScreen from "../screens/ProjectsScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import NetworkScreen from "../screens/NetworkScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { useAuth } from "../context/AuthContext";

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const tabBackground = isDark ? "rgba(11, 18, 38, 0.92)" : "rgba(255, 255, 255, 0.96)";
  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(11,99,180,0.12)";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          marginHorizontal: 12,
          marginBottom: 12,
          height: 68,
          borderRadius: 18,
          borderTopWidth: 0,
          backgroundColor: tabBackground,
          borderWidth: 1,
          borderColor,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 12,
        },
        tabBarActiveTintColor: "#22d3ee",
        tabBarInactiveTintColor: isDark ? "#9ca3af" : "#4b5563",
        tabBarLabelStyle: { fontWeight: "600", fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Ana Sayfa"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tersaneler"
        component={ProjectsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="sail-boat" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Giderler"
        component={ExpensesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-multiple" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Network"
        component={NetworkScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const RootNavigator: React.FC = () => {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Oturum kontrol ediliyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={
        colorScheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme
      }
    >
      {user ? (
        <TabNavigator />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
