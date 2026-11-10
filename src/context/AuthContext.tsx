import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'super_admin' | 'moderator';
  email?: string;
  phone?: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dimla_admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('dimla_admin_token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    fetch('/api/admin/me', {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.admin) {
          setAdmin(data.admin);
          setToken(storedToken);
        } else {
          localStorage.removeItem('dimla_admin_token');
          setAdmin(null);
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('dimla_admin_token');
        setAdmin(null);
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (newToken: string, user: AdminUser) => {
    localStorage.setItem('dimla_admin_token', newToken);
    setToken(newToken);
    setAdmin(user);
  };

  const logout = () => {
    localStorage.removeItem('dimla_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: Boolean(token && admin),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
