import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchMe, type AuthMeResponse } from "../api/auth";
import { getBasicAuthToken, setBasicAuthToken } from "../api/http";
import { useNavigate } from "react-router-dom";

type AuthState = {
  me: AuthMeResponse | null;
  isLoading: boolean;
  loginBasic: (email: string, password: string) => Promise<AuthMeResponse>;
  // logoutAndRedirect: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

function toBasicToken(email: string, password: string) {
  return "Basic " + btoa(`${email}:${password}`);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // const navigate = useNavigate();
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getBasicAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchMe()
      .then(setMe)
      .catch(() => {
        setBasicAuthToken(null);
        setMe(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function loginBasic(email: string, password: string) {
    const token = toBasicToken(email, password);
    setBasicAuthToken(token);

    try {
      const data = await fetchMe();
      setMe(data);
      return data;
    } catch (err) {
      setBasicAuthToken(null);
      setMe(null);
      throw err;
    }
  }

  function logout() {
    setBasicAuthToken(null);
    setMe(null);
  }

  function logoutAndRedirect() {
    logout();
    // navigate("/", { replace: true });
  }

  const value = useMemo(
    () => ({ me, isLoading, loginBasic, logout, logoutAndRedirect }),
    [me, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
