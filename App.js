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
import AnalysisScreen from './screens/AnalysisScreen';
import PostScreen from './screens/PostScreen';
import RealtimeScreen from './screens/RealtimeScreen';
import { SettingsScreen } from './screens/PlaceholderScreens';

// 認証状態を管理するためのContext
export const AuthContext = createContext();
// 設定（精度低下・カオス度など）を管理するためのContext
export const SettingsContext = createContext();

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
          else if (route.name === 'Analysis') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'Post') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Realtime') iconName = focused ? 'pulse' : 'pulse-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';

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
      <Tab.Screen name="Analysis" component={AnalysisScreen} options={{ title: '分析' }} />
      <Tab.Screen name="Post" component={PostScreen} options={{ title: '投稿' }} />
      <Tab.Screen name="Realtime" component={RealtimeScreen} options={{ title: 'リアルタイム' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '設定' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 精度設定の状態
  const [settings, setSettings] = useState({
    chaosLevel: 0.2,       // カオス度
    minorLevel: 0.1,       // マイナー度
    personalizedLevel: 0.7, // パーソナライズ度
    regionIndex: 0         // 地域設定インデックス（0:JP, 1:US, 2:IL...）
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
      <SettingsContext.Provider value={{ settings, updateSetting }}>
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
      </SettingsContext.Provider>
    </AuthContext.Provider>
  );
}
