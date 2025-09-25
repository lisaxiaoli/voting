"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAccount } from 'wagmi';

interface AuthState {
  isLoggedIn: boolean;
  currentDID: string | undefined;
  isLoading: boolean;
  authToken: string | undefined;
}

interface AuthActions {
  login: (did: string, token?: string) => void;
  logout: () => void;
  checkAuthStatus: () => void;
  setAuthState: (state: Partial<AuthState>) => void;
}

interface AuthContextType extends AuthState, AuthActions { }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isConnected } = useAccount();
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    currentDID: undefined,
    isLoading: true,
    authToken: undefined,
  });

  console.log('🔄 AuthProvider 初始化，当前状态:', authState);

  // 设置认证状态的通用方法
  const updateAuthState = useCallback((newState: Partial<AuthState>) => {
    console.log('🔄 AuthProvider updateAuthState 被调用:', newState);
    setAuthState(prevState => {
      const newAuthState = {
        ...prevState,
        ...newState,
      };
      console.log('🔄 AuthProvider 状态更新:', prevState, '->', newAuthState);
      return newAuthState;
    });
  }, []);

  // 检查认证状态
  const checkAuthStatus = useCallback(() => {
    if (typeof window === "undefined") return;

    console.log('🔍 checkAuthStatus 开始检查...');
    console.log('🔍 isConnected:', isConnected);

    try {
      const storedDID = localStorage.getItem("currentDID");
      const isLoggedInStatus = localStorage.getItem("isLoggedIn") === "true";
      const storedToken = localStorage.getItem("auth_token");

      console.log('🔍 localStorage 数据:', {
        storedDID,
        isLoggedInStatus,
        storedToken: !!storedToken
      });

      const newIsLoggedIn = isLoggedInStatus && !!storedDID && isConnected;
      const newCurrentDID = newIsLoggedIn ? storedDID : undefined;

      console.log('🔍 计算结果:', {
        newIsLoggedIn,
        newCurrentDID
      });

      // 同时设置 cookie（供中间件使用）
      if (newIsLoggedIn && storedDID) {
        document.cookie = `is_logged_in=true; path=/; max-age=86400`; // 24小时
        document.cookie = `current_did=${storedDID}; path=/; max-age=86400`;
        if (storedToken) {
          document.cookie = `auth_token=${storedToken}; path=/; max-age=86400`;
        }
      } else {
        // 清除 cookie
        document.cookie = 'is_logged_in=false; path=/; max-age=0';
        document.cookie = 'current_did=; path=/; max-age=0';
        document.cookie = 'auth_token=; path=/; max-age=0';
      }

      updateAuthState({
        isLoggedIn: newIsLoggedIn,
        currentDID: newCurrentDID,
        authToken: newIsLoggedIn ? storedToken || undefined : undefined,
        isLoading: false,
      });

      // 触发自定义事件，通知其他组件状态变化
      window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: {
          isLoggedIn: newIsLoggedIn,
          currentDID: newCurrentDID,
          authToken: newIsLoggedIn ? storedToken || undefined : undefined,
        }
      }));
    } catch (error) {
      console.error("检查认证状态失败:", error);
      updateAuthState({
        isLoggedIn: false,
        currentDID: undefined,
        authToken: undefined,
        isLoading: false,
      });
    }
  }, [isConnected, updateAuthState]);

  // 登录
  const login = useCallback((did: string, token?: string) => {
    if (typeof window === "undefined") return;

    console.log('🔐 AuthContext login 被调用:', { did, token: !!token });

    try {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentDID", did);
      if (token) {
        localStorage.setItem("auth_token", token);
      }

      // 设置 cookie
      document.cookie = `is_logged_in=true; path=/; max-age=86400`;
      document.cookie = `current_did=${did}; path=/; max-age=86400`;
      if (token) {
        document.cookie = `auth_token=${token}; path=/; max-age=86400`;
      }

      updateAuthState({
        isLoggedIn: true,
        currentDID: did,
        authToken: token,
        isLoading: false,
      });

      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: {
          isLoggedIn: true,
          currentDID: did,
          authToken: token,
        }
      }));

      console.log('✅ 登录成功，状态已更新:', { did, token: !!token });

      // 立即触发状态检查，确保状态同步
      console.log('🔄 立即触发状态检查...');
      checkAuthStatus();
    } catch (error) {
      console.error("登录失败:", error);
    }
  }, [updateAuthState, checkAuthStatus]);

  // 登出
  const logout = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentDID");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_info");

      // 清除 cookie
      document.cookie = 'is_logged_in=false; path=/; max-age=0';
      document.cookie = 'current_did=; path=/; max-age=0';
      document.cookie = 'auth_token=; path=/; max-age=0';

      updateAuthState({
        isLoggedIn: false,
        currentDID: undefined,
        authToken: undefined,
        isLoading: false,
      });

      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: {
          isLoggedIn: false,
          currentDID: undefined,
          authToken: undefined,
        }
      }));

      console.log('✅ 登出成功，状态已清除');
    } catch (error) {
      console.error("登出失败:", error);
    }
  }, [updateAuthState]);

  // 初始化时检查认证状态
  useEffect(() => {
    // 立即检查一次
    checkAuthStatus();

    // 延迟再次检查，确保所有组件都已挂载
    const timeoutId = setTimeout(() => {
      console.log('🔄 延迟检查认证状态...');
      checkAuthStatus();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [checkAuthStatus]);

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentDID" || e.key === "isLoggedIn" || e.key === "auth_token") {
        checkAuthStatus();
      }
    };

    // 监听自定义事件
    const handleAuthStateChange = (e: CustomEvent) => {
      console.log('🔄 收到认证状态变化事件:', e.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChanged", handleAuthStateChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleAuthStateChange as EventListener);
    };
  }, [checkAuthStatus]);

  // 监听钱包连接状态变化
  useEffect(() => {
    if (!isConnected) {
      // 钱包断开连接时自动登出
      logout();
    }
  }, [isConnected, logout]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    checkAuthStatus,
    setAuthState: updateAuthState,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义 hook 来使用 Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
