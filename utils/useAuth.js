// ✅ src/utils/useAuth.js
import { useEffect, useState, useCallback } from "react";
import { safeFetch, postJSON } from "./api";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost/educonnect-backend";

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -----------------------------
     🔍 Check Session on Mount
  ----------------------------- */
  const checkSession = useCallback(async () => {
    setLoading(true);
    const res = await safeFetch(`${BASE_URL}/validate_session.php`, {
      credentials: "include",
    });

    const isAuth = res.success || res.authenticated;

    if (isAuth && res.user) {
      setAuthenticated(true);
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
    } else {
      setAuthenticated(false);
      setUser(null);
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /* -----------------------------
     🔑 Login
  ----------------------------- */
  const login = async (email, password) => {
    const res = await postJSON("login.php", { email, password });
    if (res.success && res.user) {
      setAuthenticated(true);
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
    } else {
      setAuthenticated(false);
      alert(res.message || "Invalid credentials");
    }
    return res;
  };

  /* -----------------------------
     🧍 Register
  ----------------------------- */
  const register = async (full_name, email, password, role = "student") => {
    const res = await postJSON("register.php", {
      full_name,
      email,
      password,
      role,
    });
    if (res.success) alert("Registration successful! You can now log in.");
    else alert(res.message || "Registration failed");
    return res;
  };

  /* -----------------------------
     🚪 Logout
  ----------------------------- */
  const logout = async () => {
    await safeFetch(`${BASE_URL}/logout.php`, { credentials: "include" });
    setAuthenticated(false);
    setUser(null);
    localStorage.removeItem("user");
  };

  /* -----------------------------
     🔁 Sync Auth State Across Tabs
  ----------------------------- */
  useEffect(() => {
    const syncAuth = (e) => {
      if (e.key === "user") {
        const updatedUser = JSON.parse(localStorage.getItem("user"));
        if (updatedUser) {
          setUser(updatedUser);
          setAuthenticated(true);
        } else {
          setUser(null);
          setAuthenticated(false);
        }
      }
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  return {
    authenticated,
    user,
    loading,
    login,
    logout,
    register,
    checkSession,
  };
}
