import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  DashboardTab: undefined;
  ExpensesTab: NavigatorScreenParams<ExpensesStackParamList>;
  ProjectsTab: NavigatorScreenParams<ProjectsStackParamList>;
  NetworkTab: NavigatorScreenParams<NetworkStackParamList>;
  PartnersTab: NavigatorScreenParams<PartnersStackParamList>;
};

// Expenses Stack
export type ExpensesStackParamList = {
  ExpensesList: undefined;
  ExpenseDetail: { expenseId: string };
  ExpenseForm: { expenseId?: string };
};

// Projects Stack
export type ProjectsStackParamList = {
  ProjectsList: undefined;
  ProjectDetail: { projectId: string };
  ProjectForm: { projectId?: string };
  StatementEditor: { projectId: string; statementId: string };
};

// Network Stack
export type NetworkStackParamList = {
  NetworkList: undefined;
  NetworkDetail: { contactId: string };
  NetworkForm: { contactId?: string };
};

// Partners Stack
export type PartnersStackParamList = {
  PartnersList: undefined;
  PartnerDetail: { partnerId: string };
  PartnerForm: { partnerId?: string };
  PartnerStatementForm: { partnerId: string; statementId?: string };
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Settings: undefined;
  Profile: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type ExpensesStackScreenProps<T extends keyof ExpensesStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ExpensesStackParamList, T>,
  MainTabScreenProps<'ExpensesTab'>
>;

export type ProjectsStackScreenProps<T extends keyof ProjectsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProjectsStackParamList, T>,
  MainTabScreenProps<'ProjectsTab'>
>;

export type NetworkStackScreenProps<T extends keyof NetworkStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<NetworkStackParamList, T>,
  MainTabScreenProps<'NetworkTab'>
>;

export type PartnersStackScreenProps<T extends keyof PartnersStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<PartnersStackParamList, T>,
  MainTabScreenProps<'PartnersTab'>
>;

// Declare global type for useNavigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
