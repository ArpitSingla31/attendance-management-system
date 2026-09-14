import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const mockUsers = {
  employee: {
    id: 'EMP-1042',
    name: 'Arpit Singla',
    role: 'Employee',
    designation: 'Software Engineer',
    department: 'Engineering',
    branch: 'Panchkula Branch',
    email: 'arpit.singla@company.com',
    initials: 'AS',
    avatarBg: 'bg-indigo-100 text-indigo-700',
    biometricId: 'BIO-88319',
    phone: '+91 98765 43210'
  },
  manager: {
    id: 'MGR-0021',
    name: 'Harsh Suri',
    role: 'Manager',
    designation: 'Engineering Director',
    department: 'Engineering & Tech Ops',
    branch: 'Engineering & Tech Ops',
    email: 'harsh.suri@company.com',
    initials: 'HS',
    avatarBg: 'bg-purple-100 text-purple-700',
    biometricId: 'BIO-11024',
    phone: '+91 98123 45678'
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (role) => {
    if (role === 'manager') setCurrentUser(mockUsers.manager);
    else setCurrentUser(mockUsers.employee);
  };

  const logout = () => setCurrentUser(null);

  const updateProfile = (updatedData) => {
    // Generate initials dynamically based on the updated name
    let newInitials = updatedData.initials;
    if (updatedData.name) {
      const parts = updatedData.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        newInitials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      } else if (parts.length === 1 && parts[0].length > 0) {
        newInitials = parts[0].substring(0, 2).toUpperCase();
      }
    }

    setCurrentUser((prev) => ({
      ...prev,
      ...updatedData,
      initials: newInitials || prev.initials
    }));
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);