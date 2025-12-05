import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import ExpenseDetailScreen from '../screens/ExpenseDetailScreen';
import ExpenseFormScreen from '../screens/ExpenseFormScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import ProjectFormScreen from '../screens/ProjectFormScreen';
import StatementEditorScreen from '../screens/StatementEditorScreen';
import NetworkScreen from '../screens/NetworkScreen';
import NetworkDetailScreen from '../screens/NetworkDetailScreen';
import NetworkFormScreen from '../screens/NetworkFormScreen';
import PartnersScreen from '../screens/PartnersScreen';
import PartnerDetailScreen from '../screens/PartnerDetailScreen';
import PartnerFormScreen from '../screens/PartnerFormScreen';
import PartnerStatementFormScreen from '../screens/PartnerStatementFormScreen';
import ProfileScreen from '../screens/ProfileScreen';

import type {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  ExpensesStackParamList,
  ProjectsStackParamList,
  NetworkStackParamList,
  PartnersStackParamList,
} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ExpensesStack = createNativeStackNavigator<ExpensesStackParamList>();
const ProjectsStack = createNativeStackNavigator<ProjectsStackParamList>();
const NetworkStack = createNativeStackNavigator<NetworkStackParamList>();
const PartnersStack = createNativeStackNavigator<PartnersStackParamList>();

// Auth Navigator
const AuthNavigator = () => {
  const { colors } = useTheme();

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
};

// Expenses Stack Navigator
const ExpensesNavigator = () => {
  const { colors } = useTheme();

  return (
    <ExpensesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <ExpensesStack.Screen
        name="ExpensesList"
        component={ExpensesScreen}
        options={{ title: 'Giderler' }}
      />
      <ExpensesStack.Screen
        name="ExpenseDetail"
        component={ExpenseDetailScreen}
        options={{ title: 'Gider Detayı' }}
      />
      <ExpensesStack.Screen
        name="ExpenseForm"
        component={ExpenseFormScreen}
        options={({ route }) => ({
          title: route.params?.expenseId ? 'Gider Düzenle' : 'Yeni Gider',
        })}
      />
    </ExpensesStack.Navigator>
  );
};

// Projects Stack Navigator
const ProjectsNavigator = () => {
  const { colors } = useTheme();

  return (
    <ProjectsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <ProjectsStack.Screen
        name="ProjectsList"
        component={ProjectsScreen}
        options={{ title: 'Tersaneler' }}
      />
      <ProjectsStack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ title: 'Tersane Detayı' }}
      />
      <ProjectsStack.Screen
        name="ProjectForm"
        component={ProjectFormScreen}
        options={({ route }) => ({
          title: route.params?.projectId ? 'Tersane Düzenle' : 'Yeni Tersane',
        })}
      />
      <ProjectsStack.Screen
        name="StatementEditor"
        component={StatementEditorScreen}
        options={{ title: 'Hakediş Düzenle' }}
      />
    </ProjectsStack.Navigator>
  );
};

// Network Stack Navigator
const NetworkNavigator = () => {
  const { colors } = useTheme();

  return (
    <NetworkStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <NetworkStack.Screen
        name="NetworkList"
        component={NetworkScreen}
        options={{ title: 'Network' }}
      />
      <NetworkStack.Screen
        name="NetworkDetail"
        component={NetworkDetailScreen}
        options={{ title: 'Kişi Detayı' }}
      />
      <NetworkStack.Screen
        name="NetworkForm"
        component={NetworkFormScreen}
        options={({ route }) => ({
          title: route.params?.contactId ? 'Kişi Düzenle' : 'Yeni Kişi',
        })}
      />
    </NetworkStack.Navigator>
  );
};

// Partners Stack Navigator
const PartnersNavigator = () => {
  const { colors } = useTheme();

  return (
    <PartnersStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <PartnersStack.Screen
        name="PartnersList"
        component={PartnersScreen}
        options={{ title: 'Ortaklar' }}
      />
      <PartnersStack.Screen
        name="PartnerDetail"
        component={PartnerDetailScreen}
        options={{ title: 'Ortak Detayı' }}
      />
      <PartnersStack.Screen
        name="PartnerForm"
        component={PartnerFormScreen}
        options={({ route }) => ({
          title: route.params?.partnerId ? 'Ortak Düzenle' : 'Yeni Ortak',
        })}
      />
      <PartnersStack.Screen
        name="PartnerStatementForm"
        component={PartnerStatementFormScreen}
        options={({ route }) => ({
          title: route.params?.statementId ? 'Dönem Düzenle' : 'Yeni Dönem',
        })}
      />
    </PartnersStack.Navigator>
  );
};

// Main Tab Navigator
const MainNavigator = () => {
  const { colors } = useTheme();

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ExpensesTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'ProjectsTab') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'NetworkTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'PartnersTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <MainTab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <MainTab.Screen
        name="ExpensesTab"
        component={ExpensesNavigator}
        options={{ title: 'Giderler' }}
      />
      <MainTab.Screen
        name="ProjectsTab"
        component={ProjectsNavigator}
        options={{ title: 'Tersaneler' }}
      />
      <MainTab.Screen
        name="NetworkTab"
        component={NetworkNavigator}
        options={{ title: 'Network' }}
      />
      <MainTab.Screen
        name="PartnersTab"
        component={PartnersNavigator}
        options={{ title: 'Ortaklar' }}
      />
    </MainTab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const { currentUserAuth, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {currentUserAuth ? (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: 'Profil',
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
              }}
            />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
