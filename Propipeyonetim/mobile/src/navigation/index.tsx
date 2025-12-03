import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, darkColors } from '../theme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import NetworkScreen from '../screens/NetworkScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const themeColors = isDark ? darkColors : colors;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Ana Sayfa':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Giderler':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Tersaneler':
              iconName = focused ? 'business' : 'business-outline';
              break;
            case 'Network':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profil':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textLight,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopWidth: 1,
          borderTopColor: themeColors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Giderler" component={ExpensesScreen} />
      <Tab.Screen name="Tersaneler" component={ProjectsScreen} />
      <Tab.Screen name="Network" component={NetworkScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const themeColors = isDark ? darkColors : colors;

  const navigationTheme = isDark ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: themeColors.primary,
      background: themeColors.background,
      card: themeColors.surface,
      text: themeColors.text,
      border: themeColors.border,
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: themeColors.primary,
      background: themeColors.background,
      card: themeColors.surface,
      text: themeColors.text,
      border: themeColors.border,
    },
  };

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: themeColors.background 
      }}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={{ 
          marginTop: 16, 
          color: themeColors.textSecondary,
          fontSize: 14 
        }}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
