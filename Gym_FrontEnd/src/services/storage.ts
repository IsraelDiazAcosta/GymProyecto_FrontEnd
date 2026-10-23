import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@gym_access_token';
const REFRESH_KEY = '@gym_refresh_token';
const USER_KEY = '@gym_user_data';

export const storage = {
  async saveTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
      }
    } catch (e) {
      console.error('Error saving tokens in storage', e);
    }
  },

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error getting access token', e);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_KEY);
    } catch (e) {
      console.error('Error getting refresh token', e);
      return null;
    }
  },

  async saveUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user data', e);
    }
  },

  async getUser(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error getting user data', e);
      return null;
    }
  },

  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
    } catch (e) {
      console.error('Error clearing auth storage', e);
    }
  },
};

