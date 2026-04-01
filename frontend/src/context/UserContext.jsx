import React, { createContext, useState, useCallback } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem("user")) || null;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loginUser = useCallback((userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setError(null);
    }, []);

    const logoutUser = useCallback(() => {
        localStorage.removeItem("user");
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        error,
        loginUser,
        logoutUser,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;