"use client";

import {
  createContext,
  useCallback,
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
  isSsoLoading: boolean;
  ssoError: string | null;
  canManageCalendar: boolean;
  isManager: boolean;
  isEmployee: boolean;
  login: (token: string) => void;
  logout: () => void;
  switchRole: () => void;
  createSsoTicket: (accessToken?: string) => Promise<string | null>;
  exchangeSsoTicket: (ticket: string) => Promise<void>;
}

interface DecodedToken {
  userId?: string;
  id?: number | string;
  name?: string;
  mail?: string;
  permissionId?: number;
  permissionLevel?: number;
  active?: boolean;
  [key: string]: unknown;
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

type SsoTicketResponse = {
  ticket?: string;
};

type SsoExchangeResponse = {
  token?: string;
  jwt?: string;
  accessToken?: string;
  data?: {
    token?: string;
    jwt?: string;
    accessToken?: string;
  };
  [key: string]: unknown;
};

function normalizePath(path: string): string {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}

function resolveApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000"
  ).replace(/\/$/, "");
}

function resolveBackendPrefix(): string {
  const backendPrefix =
    process.env.NEXT_PUBLIC_BACKEND_API_PREFIX ??
    process.env.BACKEND_API_PREFIX ??
    "";

  if (!backendPrefix) {
    return "";
  }

  return normalizePath(backendPrefix);
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  const rawBody = await response.text();

  if (!rawBody.trim()) {
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return rawBody;
    }
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload === "object") {
    const candidate = payload as {
      message?: unknown;
      error?: unknown;
      detail?: unknown;
    };
    if (typeof candidate.message === "string") {
      return candidate.message;
    }
    if (typeof candidate.error === "string") {
      return candidate.error;
    }
    if (typeof candidate.detail === "string") {
      return candidate.detail;
    }
  }

  return fallback;
}

function extractTokenFromExchangePayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const value = payload as SsoExchangeResponse;
  return (
    value.token ??
    value.jwt ??
    value.accessToken ??
    value.data?.token ??
    value.data?.jwt ??
    value.data?.accessToken ??
    null
  );
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [ssoTicket, setSsoTicket] = useState<string | null>(null);
  const [testRole, setTestRole] = useState<"manager" | "employee">("manager");
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [ssoError, setSsoError] = useState<string | null>(null);
  const ssoEndpoint = process.env.NEXT_PUBLIC_SSO_TICKET_ENDPOINT ?? "/sso/ticket";
  const ssoExchangeEndpoint =
    process.env.NEXT_PUBLIC_SSO_EXCHANGE_ENDPOINT ?? "/sso/exchange";
  const ssoTargetApp = process.env.NEXT_PUBLIC_SSO_TARGET_APP ?? "calendar-frontend";

  const resolveApiUrl = useCallback((endpoint: string) => {
    return `${resolveApiBaseUrl()}${resolveBackendPrefix()}${normalizePath(endpoint)}`;
  }, []);

  const applyToken = useCallback((nextToken: string) => {
    const decoded: DecodedToken = jwtDecode(nextToken);
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setUser(decoded);
  }, []);

  const createSsoTicket = useCallback(
    async (accessToken?: string): Promise<string | null> => {
      const tokenToUse = accessToken ?? token;

      if (!tokenToUse) {
        setSsoError("Nao foi possivel gerar ticket SSO: token ausente.");
        return null;
      }

      setIsSsoLoading(true);
      setSsoError(null);

      try {
        const response = await fetch(resolveApiUrl(ssoEndpoint), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenToUse}`,
          },
          body: JSON.stringify({ targetApp: ssoTargetApp }),
        });

        const payload = await parseResponseBody(response);
        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              payload,
              `Falha ao gerar ticket SSO (${response.status}).`,
            ),
          );
        }

        const data = payload as SsoTicketResponse;
        if (!data.ticket) {
          throw new Error("Resposta de SSO sem o campo ticket.");
        }

        localStorage.setItem("sso_ticket", data.ticket);
        setSsoTicket(data.ticket);
        return data.ticket;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro inesperado ao gerar ticket SSO.";
        setSsoError(message);
        throw error;
      } finally {
        setIsSsoLoading(false);
      }
    },
    [resolveApiUrl, ssoEndpoint, ssoTargetApp, token],
  );

  const exchangeSsoTicket = useCallback(
    async (ticket: string): Promise<void> => {
      if (!ticket) {
        setSsoError("Ticket SSO ausente para exchange.");
        return;
      }

      setIsSsoLoading(true);
      setSsoError(null);

      try {
        const response = await fetch(resolveApiUrl(ssoExchangeEndpoint), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket,
            targetApp: ssoTargetApp,
          }),
        });

        const payload = await parseResponseBody(response);
        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              payload,
              `Falha ao validar ticket SSO (${response.status}).`,
            ),
          );
        }

        const exchangedToken = extractTokenFromExchangePayload(payload);
        if (exchangedToken) {
          applyToken(exchangedToken);
        }

        localStorage.removeItem("sso_ticket");
        setSsoTicket(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro inesperado ao validar ticket SSO.";
        setSsoError(message);
        throw error;
      } finally {
        setIsSsoLoading(false);
      }
    },
    [applyToken, resolveApiUrl, ssoExchangeEndpoint, ssoTargetApp],
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedTicket = localStorage.getItem("sso_ticket");
    const fallbackToken = process.env.NEXT_PUBLIC_TEST_MANAGER_TOKEN;
    const tokenToUse = storedToken || fallbackToken;
    const queryParams = new URLSearchParams(window.location.search);
    const incomingTicket =
      queryParams.get("ssoTicket") ?? queryParams.get("ticket");

    if (storedTicket) {
      setSsoTicket(storedTicket);
    }

    if (incomingTicket) {
      localStorage.setItem("sso_ticket", incomingTicket);
      setSsoTicket(incomingTicket);
      exchangeSsoTicket(incomingTicket).catch((error) => {
        console.error("Nao foi possivel validar ticket SSO de entrada:", error);
      });
    }

    if (!tokenToUse) {
      return;
    }

    try {
      applyToken(tokenToUse);
      if (!storedToken && fallbackToken) {
        localStorage.setItem("token", fallbackToken);
      }

      createSsoTicket(tokenToUse).catch((error) => {
        console.error("Nao foi possivel gerar ticket SSO:", error);
      });
    } catch (error) {
      console.error("Token invalido:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("sso_ticket");
      setSsoTicket(null);
      setSsoError("Token invalido. Realize login novamente.");
    }
  }, [applyToken, createSsoTicket, exchangeSsoTicket]);

  const switchRole = () => {
    setTestRole((prev) => {
      const nextRole = prev === "manager" ? "employee" : "manager";
      setUser(nextRole === "manager" ? mockManager : mockEmployee);
      return nextRole;
    });
  };

  const login = (newToken: string) => {
    try {
      applyToken(newToken);
      createSsoTicket(newToken).catch((error) => {
        console.error("Nao foi possivel gerar ticket SSO:", error);
      });
    } catch (error) {
      console.error("Token invalido:", error);
      setSsoError("Token invalido.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sso_ticket");
    setToken(null);
    setSsoTicket(null);
    setUser(null);
    setSsoError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        ssoTicket,
        user,
        isSsoLoading,
        ssoError,
        canManageCalendar: user
          ? checkCanManageCalendar(user.permissionLevel ?? 0)
          : false,
        isManager: user ? checkIsManager(user.permissionLevel ?? 0) : false,
        isEmployee: user ? checkIsEmployee(user.permissionLevel ?? 0) : false,
        login,
        logout,
        switchRole,
        createSsoTicket,
        exchangeSsoTicket,
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
