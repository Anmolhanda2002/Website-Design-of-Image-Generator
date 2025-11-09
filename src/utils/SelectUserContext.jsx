import React, { createContext, useContext, useEffect, useState } from "react";

const SelectedUserContext = createContext();

export const SelectedUserProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(() => {
    const stored = localStorage.getItem("selected_user");
    return stored ? JSON.parse(stored) : null;
  });

  // 🔄 Sync context to localStorage whenever it changes
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem("selected_user", JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem("selected_user");
    }
  }, [selectedUser]);

  // 🔁 Sync if localStorage changes (e.g., other tab)
  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem("selected_user");
      setSelectedUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <SelectedUserContext.Provider value={{ selectedUser, setSelectedUser }}>
      {children}
    </SelectedUserContext.Provider>
  );
};

export const useSelectedUser = () => useContext(SelectedUserContext);
