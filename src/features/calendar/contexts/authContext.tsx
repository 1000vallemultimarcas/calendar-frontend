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
  ssoTicket: string | null;
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
  const [ssoTicket, setSsoTicket] = useState<string | null>(null);
  const [testRole, setTestRole] = useState<"manager" | "employee">("manager");
  const [user, setUser] = useState<DecodedToken | null>(null);
  const ssoEndpoint = process.env.NEXT_PUBLIC_SSO_TICKET_ENDPOINT ?? "/sso/ticket";
  const ssoTargetApp = process.env.NEXT_PUBLIC_SSO_TARGET_APP ?? "calendar-frontend";

  const requestSsoTicket = async (accessToken: string) => {
    const baseUrl = (
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:4000"
    ).replace(/\/$/, "");

    const backendPrefix =
      process.env.NEXT_PUBLIC_BACKEND_API_PREFIX ??
      process.env.BACKEND_API_PREFIX ??
      "";
    const normalizedPrefix = backendPrefix
      ? backendPrefix.startsWith("/")
        ? backendPrefix
        : `/${backendPrefix}`
      : "";
    const normalizedEndpoint = ssoEndpoint.startsWith("/")
      ? ssoEndpoint
      : `/${ssoEndpoint}`;

    const response = await fetch(
      `${baseUrl}${normalizedPrefix}${normalizedEndpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ targetApp: ssoTargetApp }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Falha ao gerar ticket SSO (${response.status}).`);
    }

    const data = (await response.json()) as { ticket?: string };
    if (!data.ticket) {
      throw new Error("Resposta de SSO sem o campo ticket.");
    }

    localStorage.setItem("sso_ticket", data.ticket);
    setSsoTicket(data.ticket);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedTicket = localStorage.getItem("sso_ticket");
    const fallbackToken = process.env.NEXT_PUBLIC_TEST_MANAGER_TOKEN;
    const tokenToUse = storedToken || fallbackToken;

    if (storedTicket) {
      setSsoTicket(storedTicket);
    }

    if (!tokenToUse) {
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(tokenToUse);

      if (!storedToken && fallbackToken) {
        localStorage.setItem("token", fallbackToken);
      }

      setToken(tokenToUse);
      setUser(decoded);

      requestSsoTicket(tokenToUse).catch((error) => {
        console.error("Nao foi possivel gerar ticket SSO:", error);
      });
    } catch (error) {
      console.error("Token invalido:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("sso_ticket");
      setSsoTicket(null);
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
      requestSsoTicket(newToken).catch((error) => {
        console.error("Nao foi possivel gerar ticket SSO:", error);
      });
    } catch (error) {
      console.error("Token invalido:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sso_ticket");
    setToken(null);
    setSsoTicket(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        ssoTicket,
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
