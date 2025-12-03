import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components";

import {
  LoginScreen,
  DashboardScreen,
  ExpensesScreen,
  ProjectsScreen,
  ProjectDetailScreen,
  StatementEditorScreen,
  NetworkScreen,
  PartnersScreen,
  PartnerDetailScreen,
  ProfileScreen
} from "../screens";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ProjectDetail: { projectId: string };
  StatementEditor: { projectId: string; statementId: string };
  PartnerDetail: { partnerId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Expenses: undefined;
  Projects: undefined;
  Network: undefined;
  Partners: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Expenses":
              iconName = focused ? "receipt" : "receipt-outline";
              break;
            case "Projects":
              iconName = focused ? "boat" : "boat-outline";
              break;
            case "Network":
              iconName = focused ? "people" : "people-outline";
              break;
            case "Partners":
              iconName = focused ? "person-circle" : "person-circle-outline";
              break;
            case "Profile":
              iconName = focused ? "settings" : "settings-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500"
        },
        headerStyle: {
          backgroundColor: theme.colors.surface
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: "600"
        },
        headerShadowVisible: false
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Ana Sayfa", headerShown: false }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ title: "Giderler" }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{ title: "Tersaneler" }}
      />
      <Tab.Screen
        name="Network"
        component={NetworkScreen}
        options={{ title: "Network" }}
      />
      <Tab.Screen
        name="Partners"
        component={PartnersScreen}
        options={{ title: "Ortaklar" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profil" }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { currentUserAuth, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Yükleniyor..." />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.mode === "dark",
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          notification: theme.colors.error
        },
        fonts: {
          regular: { fontFamily: "System", fontWeight: "400" },
          medium: { fontFamily: "System", fontWeight: "500" },
          bold: { fontFamily: "System", fontWeight: "700" },
          heavy: { fontFamily: "System", fontWeight: "800" }
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface
          },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: {
            fontWeight: "600"
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: theme.colors.background
          }
        }}
      >
        {currentUserAuth ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProjectDetail"
              component={ProjectDetailScreen}
              options={{ title: "Tersane Detayı" }}
            />
            <Stack.Screen
              name="StatementEditor"
              component={StatementEditorScreen}
              options={{ title: "Hakediş Editörü" }}
            />
            <Stack.Screen
              name="PartnerDetail"
              component={PartnerDetailScreen}
              options={{ title: "Ortak Detayı" }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
