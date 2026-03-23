import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://script.google.com/macros/s/AKfycbxKm6igykPJKgc3UxIA6bM-Q62W8WUAgJcP2LXBWgkO_5AcztfyQGfdy6MwZ5GPpfbd/exec';
const USER_KEY = 'auth_user';

export const authService = {
  /**
   * 認証リクエストの実行
   */
  async _request(params) {
    if (!API_URL.includes('https://')) {
      throw { code: 'auth/config-error', message: 'API URLが設定されていません' };
    }

    try {
      console.log('--- Auth Request Start ---');
      console.log('Action:', params.action);
      
      // POST通信に戻し、リダイレクトを確実に追跡する
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(params),
        redirect: 'follow'
      });

      const responseText = await response.text();
      
      // レスポンスがHTML（<から始まる）場合、エラーとしてログに出力
      if (responseText.trim().startsWith('<')) {
        console.error('GAS returned HTML instead of JSON. First 200 chars:');
        console.error(responseText.substring(0, 200));
        throw { code: 'auth/server-error', message: 'サーバーから不正な応答がありました（HTML）' };
      }

      console.log('Raw Response:', responseText);
      const data = JSON.parse(responseText);

      if (data.status === 'success') {
        return data.user;
      } else {
        throw { code: data.code || 'auth/error', message: data.message || 'Error' };
      }
    } catch (error) {
      console.error('Auth request failed:', error);
      throw error;
    }
  },

  async login(email, password) {
    const user = await this._request({ action: 'login', email, password });
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  async register(email, password) {
    const user = await this._request({ action: 'register', email, password });
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  async logout() {
    await AsyncStorage.removeItem(USER_KEY);
  },

  async getCurrentUser() {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
};
