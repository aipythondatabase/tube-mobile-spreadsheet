import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { authService } from '../services/authService';
import { AuthContext } from '../App';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#1a1614', // 統一されたブラウン
  primary: '#e6d5c3', // ベージュ
  secondary: '#8b5e3c', // ブラウンアクセント
  text: '#ffffff',
  error: '#ff4444'
};

export default function LoginScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(email, password);
      setUser(user);
    } catch (error) {
      console.log('Login Error:', error);
      let errorMessage = 'ログインに失敗しました。';
      if (error.code === 'auth/invalid-credentials') {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません。';
      }
      Alert.alert('エラー', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        <View style={styles.headerArea}>
          <Text style={styles.title}>Tube Mobile</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>アカウントにログインして動画を視聴</Text>
        </View>

        <View style={styles.formArea}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>メールアドレス</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor="#444"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>パスワード</Text>
            <TextInput
              style={styles.input}
              placeholder="パスワードを入力"
              placeholderTextColor="#444"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.bg} />
            ) : (
              <Text style={styles.buttonText}>ログイン</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerLinkText}>アカウントを新規作成</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Tube Mobile Team</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    maxWidth: 400,
  },
  headerArea: {
    marginBottom: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.secondary,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 15,
  },
  formArea: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#2d2421',
    height: 50,
    paddingHorizontal: 15,
    color: COLORS.text,
    fontSize: 16,
    borderRadius: 4,
  },
  loginButton: {
    backgroundColor: COLORS.secondary,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  registerLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  registerLinkText: {
    color: COLORS.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
  },
  footerText: {
    fontSize: 10,
    color: '#444',
  },
});
