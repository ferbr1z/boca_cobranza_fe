import { useState, useEffect } from "react";
import { useGetProfileQuery } from "../services/api/authApi";

const getIsAdminFromStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      return u?.role === "ADMIN";
    }
  } catch {}
  return false;
};

const getCanModifyStockFromStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      return u?.modifyStock === true;
    }
  } catch {}
  return false;
};

export const useAuth = () => {
  const [storageToken, setStorageToken] = useState(() =>
    localStorage.getItem("token")
  );

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetProfileQuery(undefined, {
    skip: !storageToken,
  });

  const isAuthenticated = !!storageToken && !!user && !error;
  const actualIsLoading = isLoading && !error;

  const [isAdmin, setIsAdmin] = useState(getIsAdminFromStorage);

  const [canModifyStock, setCanModifyStock] = useState(
    getCanModifyStockFromStorage
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setStorageToken(localStorage.getItem("token"));
      setIsAdmin(getIsAdminFromStorage());
      setCanModifyStock(getCanModifyStockFromStorage());
    };

    // Listen for custom storage event
    window.addEventListener("auth-storage-change", handleStorageChange);

    return () => {
      window.removeEventListener("auth-storage-change", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (error && storageToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setStorageToken(null);
      setIsAdmin(false);
    }
  }, [error, storageToken]);

  useEffect(() => {
    if (user) {
      const stored = (() => {
        try {
          const raw = localStorage.getItem("user");
          return raw ? JSON.parse(raw) : {};
        } catch {
          return {};
        }
      })();
      const nextUser = {
        ...stored,
        id: user.id ?? stored.id,
        nombre: user.nombre ?? stored.nombre,
        telefono: user.telefono ?? stored.telefono,
        localId: user.localId ?? stored.localId,
        localNombre: user.localNombre ?? stored.localNombre,
        modifyStock: user.modifyStock ?? stored.modifyStock,
      };
      try {
        localStorage.setItem("user", JSON.stringify(nextUser));
        setIsAdmin(user.role === "ADMIN");
        setCanModifyStock(user.modifyStock || false);
      } catch {}
    } else {
      setIsAdmin(getIsAdminFromStorage());
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return {
    user,
    isLoading: actualIsLoading,
    isAuthenticated,
    isAdmin,
    canModifyStock,
    logout,
    refetch,
  };
};
