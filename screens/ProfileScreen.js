import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { authService } from '../services/authService';
import { AuthContext } from '../App';

export default function ProfileScreen() {
  const { user, setUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      Alert.alert('エラー', 'ログアウトに失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>USER_PROFILE</Text>
      <View style={styles.infoBox}>
        <Text style={styles.label}>IDENTIFIER</Text>
        <Text style={styles.value}>{user?.email || 'OFFLINE'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>EXIT_SYSTEM (LOGOUT)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1614', // Deep Abyss Brown
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: '#8b5e3c',
    fontWeight: 'bold',
    marginBottom: 40,
    letterSpacing: 2,
  },
  infoBox: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#2d2421',
    borderRadius: 4,
    marginBottom: 50,
    backgroundColor: '#161b22', // 深い色で引き締める
  },
  label: {
    color: '#3d322d',
    fontSize: 10,
    marginBottom: 5,
    letterSpacing: 1,
  },
  value: {
    color: '#e6d5c3',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#ff4444',
    backgroundColor: 'rgba(255, 68, 68, 0.05)',
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
});
