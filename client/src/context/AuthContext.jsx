import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext();

const persistUserIdentity = (user) => {
  const { _id, name, email, role, isActive } = user;
  localStorage.setItem(
    "bloodcare_user",
    JSON.stringify({ _id, name, email, role, isActive }),
  );
};

const readSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("bloodcare_user");
    const user = savedUser ? JSON.parse(savedUser) : null;
    if (
      user &&
      (typeof user !== "object" ||
        !["PATIENT", "TECHNICIAN", "ADMIN"].includes(user.role))
    ) {
      localStorage.removeItem("bloodcare_user");
      return null;
    }
    return user;
  } catch {
    localStorage.removeItem("bloodcare_user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSavedUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = localStorage.getItem("bloodcare_token");
      if (!token) {
        localStorage.removeItem("bloodcare_user");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        const currentUser = data.data;
        setUser(currentUser);
        persistUserIdentity(currentUser);
      } catch {
        localStorage.removeItem("bloodcare_token");
        localStorage.removeItem("bloodcare_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    const sessionUser = data.data.user;
    localStorage.setItem("bloodcare_token", data.data.token);
    persistUserIdentity(sessionUser);
    setUser(sessionUser);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    const sessionUser = data.data.user;
    localStorage.setItem("bloodcare_token", data.data.token);
    persistUserIdentity(sessionUser);
    setUser(sessionUser);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("bloodcare_token");
    localStorage.removeItem("bloodcare_user");
    setUser(null);
    window.location.href = "/login";
  };

  const updateProfile = async (payload) => {
    const { data } = await api.patch("/auth/me", payload);
    const updatedUser = data.data;
    persistUserIdentity(updatedUser);
    setUser(updatedUser);
    return data;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    persistUserIdentity(updatedUser);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      updateUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
