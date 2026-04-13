"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import {
  isEmployee as checkIsEmployee,
  isManager as checkIsManager,
} from "../lib/permissions";

interface AuthContextType {
  token: string | null;
  user: DecodedToken | null;
  isManager: boolean;
  isEmployee: boolean;
  login: (token: string) => void;
  logout: () => void;
  switchRole: () => void;
}

interface DecodedToken {
  userId: string;
  id: number;
  name: string;
  mail: string;
  permissionId: number;
  permissionLevel: number;
  active: boolean;
}

const mockManager: DecodedToken = {
  userId: "1",
  id: 1,
  name: "Gerente Teste",
  mail: "gerente@email.com",
  permissionId: 1,
  permissionLevel: 2,
  active: true,
};

const mockEmployee: DecodedToken = {
  userId: "2",
  id: 2,
  name: "Funcionário Teste",
  mail: "funcionario@email.com",
  permissionId: 1,
  permissionLevel: 1,
  active: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [testRole, setTestRole] = useState<"manager" | "employee">("manager");
  const [user, setUser] = useState<DecodedToken | null>(mockManager);

  const switchRole = () => {
    setTestRole((prev) => {
      const nextRole = prev === "manager" ? "employee" : "manager";
      setUser(nextRole === "manager" ? mockManager : mockEmployee);
      return nextRole;
    });
  };

  const login = (newToken: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(newToken);

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(decoded);
    } catch (error) {
      console.error("Token inválido:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isManager: user ? checkIsManager(user.permissionLevel) : false,
        isEmployee: user ? checkIsEmployee(user.permissionLevel) : false,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};