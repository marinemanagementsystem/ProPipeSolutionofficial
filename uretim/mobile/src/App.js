import React, { useState } from 'react';
import { SafeAreaView, View, Text, StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import DepartmanScreen from './screens/DepartmanScreen';

const Navigator = () => {
  const { user } = useAuth();
  const [route, setRoute] = useState({ name: 'home', params: {} });

  if (!user) return <LoginScreen />;

  if (route.name === 'departman') {
    return <DepartmanScreen route={route} goHome={() => setRoute({ name: 'home', params: {} })} />;
  }

  return <HomeScreen onDepartman={(params) => setRoute({ name: 'departman', params })} />;
};

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1224' }}>
        <StatusBar barStyle="light-content" />
        <Navigator />
      </SafeAreaView>
    </AuthProvider>
  );
}
