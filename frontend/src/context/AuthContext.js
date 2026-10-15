import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
          // Check if user is logged in

    // const storedToken = localStorage.getItem("token");
    // const storedUser = localStorage.getItem("user");

    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);


  
  // const login = (userData, authToken) => {
    // setUser(userData);
    // setToken(authToken);
    // localStorage.setItem("token", authToken);
    // localStorage.setItem("user", JSON.stringify(userData));
  // };

  const login = (userData, authToken, rememberMe) => { // ensure no stale tokens remain
  setUser(userData);
  setToken(authToken);

  // clear both storages before writing the new credentials
  localStorage.clear();
  sessionStorage.clear();

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("token", authToken);
  storage.setItem("user", JSON.stringify(userData));
};



  const logout = () => {
    setUser(null);
    setToken(null);
    // localStorage.removeItem("token");
    // localStorage.removeItem("user");
    localStorage.clear();
    sessionStorage.clear();


  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
