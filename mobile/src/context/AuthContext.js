import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, profileApi } from '../services/api';
import { initBaseUrl } from '../config/apiConfig';

const AuthContext = createContext();

const TOKEN_KEY = '@careertwin_token';
const USER_KEY = '@careertwin_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initBaseUrl();
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Refresh profile in background
          try {
            const profileRes = await profileApi.getProfile();
            const profileData = profileRes?.data || profileRes;
            if (profileData) {
              setUser(profileData);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(profileData));
            }
          } catch (e) {
            console.log('Background profile refresh skipped:', e.message);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const payload = res?.data || res;
    if (payload?.token) {
      const authToken = payload.token;
      const authUser = {
        id: payload.userId,
        email: payload.email,
        fullName: payload.fullName,
        college: payload.college,
        branch: payload.branch,
        graduationYear: payload.graduationYear,
        roles: payload.roles,
      };
      await AsyncStorage.setItem(TOKEN_KEY, authToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(authUser));
      setToken(authToken);
      setUser(authUser);
      return authUser;
    }
    throw new Error('Authentication response did not contain a valid token');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const payload = res?.data || res;
    if (payload?.token) {
      const authToken = payload.token;
      const authUser = {
        id: payload.userId,
        email: payload.email,
        fullName: payload.fullName,
        college: payload.college,
        branch: payload.branch,
        graduationYear: payload.graduationYear,
        roles: payload.roles,
      };
      await AsyncStorage.setItem(TOKEN_KEY, authToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(authUser));
      setToken(authToken);
      setUser(authUser);
      return authUser;
    }
    return payload;
  };

  const loginDemo = async () => {
    const credRes = await authApi.getDemoCredentials();
    const creds = credRes?.data || credRes;
    return await login(creds.email, creds.password);
  };

  const updateUser = async (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error clearing storage on logout:', e);
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        loginDemo,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
