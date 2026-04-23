"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import {
  canManageCalendar as checkCanManageCalendar,
  isEmployee as checkIsEmployee,
  isManager as checkIsManager,
} from "../lib/permissions";

interface AuthContextType {
  token: string | null;
  user: DecodedToken | null;
  canManageCalendar: boolean;
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
  userId: "f3b035ac-49f7-4e92-a715-35680bf63175",
  id: 1,
  name: "Gerente Teste",
  mail: "gerente@email.com",
  permissionId: 1,
  permissionLevel: 2,
  active: true,
};

const mockEmployee: DecodedToken = {
  userId: "3e36ea6e-78f3-40dd-ab8c-a6c737c3c422",
  id: 2,
  name: "Funcionario Teste",
  mail: "funcionario@email.com",
  permissionId: 1,
  permissionLevel: 1,
  active: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [testRole, setTestRole] = useState<"manager" | "employee">("manager");
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromQuery = params.get("token");
    const storedToken = localStorage.getItem("token");
    const fallbackToken = process.env.NEXT_PUBLIC_TEST_MANAGER_TOKEN;
    const tokenToUse = tokenFromQuery || storedToken || fallbackToken;

    if (!tokenToUse) {
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(tokenToUse);

      if (tokenFromQuery) {
        localStorage.setItem("token", tokenFromQuery);

        const nextParams = new URLSearchParams(window.location.search);
        nextParams.delete("token");
        const nextQuery = nextParams.toString();
        const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
        window.history.replaceState(null, "", nextUrl);
      } else if (!storedToken && fallbackToken) {
        localStorage.setItem("token", fallbackToken);
      }

      setToken(tokenToUse);
      setUser(decoded);
    } catch (error) {
      console.error("Token invalido:", error);
      localStorage.removeItem("token");
    }
  }, []);

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
      console.error("Token invalido:", error);
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
        canManageCalendar: user
          ? checkCanManageCalendar(user.permissionLevel)
          : false,
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
