import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { setAuthIntegration } from "../services/api";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "clonX.authSession";

function parseSession(value) {
  if (!value) return { token: null, user: null };

  try {
    const parsed = JSON.parse(value);
    return {
      token: typeof parsed.token === "string" ? parsed.token : null,
      user: parsed.user && typeof parsed.user === "object" ? parsed.user : null,
    };
  } catch {
    return { token: null, user: null };
  }
}

function readStoredSession() {
  try {
    const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedSession) return parseSession(savedSession);

    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }

    return { token: localStorage.getItem("token"), user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);
  const { token, user } = session;

  const signIn = useCallback((nextToken, nextUser) => {
    const nextSession = { token: nextToken, user: nextUser };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      // Keep the active tab usable if browser storage is unavailable.
    }

    setSession(nextSession);
  }, []);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      // The in-memory session is still cleared below.
    }

    setSession({ token: null, user: null });
  }, []);
  useLayoutEffect(() => {
    setAuthIntegration({
      getToken: () => token,
      onUnauthorized: (failedToken) => {
        if (token === failedToken) signOut();
      },
    });

    const handleStorage = (event) => {
      if (event.key === AUTH_STORAGE_KEY) {
        setSession(parseSession(event.newValue));
      } else if (event.key === null) {
        setSession({ token: null, user: null });
      }
    };

    window.addEventListener("storage", handleStorage);

    try {
      const currentSession = { token, user };
      if (
        !localStorage.getItem(AUTH_STORAGE_KEY) &&
        (currentSession.token || currentSession.user)
      ) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentSession));
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      // Storage synchronization is unavailable in this browser context.
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      setAuthIntegration();
    };
  }, [token, user, signOut]);

  const value = useMemo(
    () => ({ token, user, signIn, signOut }),
    [token, user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
