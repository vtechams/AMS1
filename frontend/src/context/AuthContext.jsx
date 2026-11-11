import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const DEFAULT_ADMIN = {
  admin_id: 'ADM-001',
  full_name: 'Administrator',
  email: 'admin@ams.local',
  role: 'SuperAdmin'
};

export function AuthProvider({ children }) {
  const [user] = useState(DEFAULT_ADMIN);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: 'open_access_token',
        isAuthenticated: true,
        loading: false,
        login: async () => ({ success: true }),
        logout: () => {}
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
