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
  bg: '#0a0a0c',
  primary: '#d1d1d1', // Silver
  secondary: '#0070ff', // Azure Blue
  accent: '#00F3FF', // Cyan Glow
  text: '#e0e0e0',
  error: '#ff0000'
};

export default function RegisterScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('警告：儀式の不備', '因果を刻むには、すべての供物（情報）が必要だ。');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('警告：共鳴の失敗', '二つの鍵が重なり合わない。因果は閉じられた。');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.register(email, password);
      Alert.alert('成功：因果の確定', '貴様の存在は此処に刻まれた。深淵へ堕ちる準備はいいか？');
      setUser(user);
    } catch (error) {
      let errorMessage = '深淵の沈黙。因果は結ばれなかった。';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'その真理の名は、既に別の因果に繋がれている。';
      }
      Alert.alert('拒絶', errorMessage);
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
      
      {/* 聖域の結界（背景装飾） */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.content}>
        <View style={styles.headerArea}>
          <Text style={styles.title}>蒼銀の断罪</Text>
          <Text style={styles.engTitle}>JUDGMENT_OF_SILVER</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>〜新しき真理の名を、此処に刻み込め〜</Text>
        </View>

        <View style={styles.formArea}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>新しき真理の名 (NEW_NAME_OF_TRUTH)</Text>
            <TextInput
              style={styles.input}
              placeholder="新たな識別子を..."
              placeholderTextColor="#444"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>深淵のキーを定義せよ (DEFINE_THE_KEY)</Text>
            <TextInput
              style={styles.input}
              placeholder="禁忌の封印鍵を..."
              placeholderTextColor="#444"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>キーの残響を確認 (CONFIRM_THE_ECHO)</Text>
            <TextInput
              style={styles.input}
              placeholder="再確認の呪文を..."
              placeholderTextColor="#444"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.buttonText}>深淵に誓う (SWEAR_TO_THE_ABYSS)</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginLinkText}>既に因果に繋がれし者 (BACK_TO_LOGIN)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>契約の鎖は、決して断ち切れぬ // SINCE_ETERNITY</Text>
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
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.secondary,
    opacity: 0.1,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.accent,
    opacity: 0.05,
  },
  content: {
    width: '85%',
    maxWidth: 400,
  },
  headerArea: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 8,
    textAlign: 'center',
  },
  engTitle: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 4,
    marginTop: -5,
    fontWeight: '300',
  },
  titleUnderline: {
    width: 200,
    height: 1,
    backgroundColor: COLORS.secondary,
    marginTop: 15,
    opacity: 0.5,
  },
  subtitle: {
    fontSize: 10,
    color: '#888',
    marginTop: 15,
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  formArea: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    color: COLORS.primary,
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: 2,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    height: 40,
    paddingHorizontal: 5,
    color: COLORS.text,
    fontSize: 16,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(184, 184, 184, 0.1)',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  loginLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  loginLinkText: {
    color: COLORS.secondary,
    fontSize: 11,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    fontSize: 9,
    color: '#444',
    letterSpacing: 2,
  },
});
