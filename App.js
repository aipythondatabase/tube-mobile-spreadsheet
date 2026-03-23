import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { authService } from './services/authService';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';
import ProfileScreen from './screens/ProfileScreen';
import { ExploreScreen, CreateScreen, LibraryScreen } from './screens/PlaceholderScreens';

// 認証状態を管理するためのContext
export const AuthContext = createContext();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ボトムタブナビゲーション
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'eye' : 'eye-outline';
          else if (route.name === 'Explore') iconName = focused ? 'compass' : 'explore-outline'; // explorer
          else if (route.name === 'Create') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Library') iconName = focused ? 'library' : 'library-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          // 特殊なアイコン名調整 (Ioniconsのバージョン対応)
          if (route.name === 'Explore') iconName = focused ? 'search' : 'search-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8b5e3c', // Copper Brown
        tabBarInactiveTintColor: '#3d322d', // Muted Brown
        tabBarStyle: {
          backgroundColor: '#1a1614', // Deep Abyss Brown
          borderTopColor: '#2d2421',
          height: 60,
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'ホーム' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: '探索' }} />
      <Tab.Screen name="Create" component={CreateScreen} options={{ title: '作成' }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ title: 'ライブラリ' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'プロフィール' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen
                name="MainTabs"
                component={TabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="VideoPlayer"
                component={VideoPlayerScreen}
                options={{ 
                  title: '動画再生', 
                  headerBackTitle: '戻る',
                  headerStyle: { backgroundColor: '#1a1614' },
                  headerTintColor: '#e6d5c3',
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
