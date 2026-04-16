import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, logout } from "../api/authService";
import { listJabatan } from "../api/jabatanService";

const AuthContext = createContext(null);

const normalizeUserPayload = (payload) => {
  if (!payload) {
    return null;
  }

  if (payload.user) {
    return payload.user;
  }

  if (payload.data?.user) {
    return payload.data.user;
  }

  if (
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
  ) {
    return payload.data;
  }

  if (typeof payload === "object" && !Array.isArray(payload)) {
    return payload;
  }

  return null;
};

const toNumericId = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : null;
};

const resolveJabatanName = (user = {}, jabatanList = []) => {
  const objectName =
    user?.jabatan && typeof user.jabatan === "object"
      ? user.jabatan.nama
      : null;

  if (typeof objectName === "string" && objectName.trim().length > 0) {
    return objectName.trim();
  }

  if (typeof user?.jabatan === "string" && Number.isNaN(Number(user.jabatan))) {
    return user.jabatan.trim();
  }

  if (
    typeof user?.jabatan_nama === "string" &&
    user.jabatan_nama.trim().length > 0
  ) {
    return user.jabatan_nama.trim();
  }

  const jabatanId = toNumericId(
    user?.jabatan_id ?? user?.jabatan?.id ?? user?.jabatan,
  );

  if (!jabatanId) {
    return "";
  }

  const foundJabatan = jabatanList.find(
    (item) => toNumericId(item?.id) === jabatanId,
  );
  return foundJabatan?.nama ?? "";
};

const enrichUserJabatan = (user, jabatanList = []) => {
  if (!user || typeof user !== "object") {
    return user;
  }

  const jabatanNama = resolveJabatanName(user, jabatanList);

  if (!jabatanNama) {
    return user;
  }

  return {
    ...user,
    jabatan_nama: jabatanNama,
  };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
  }, []);

  const setAuthToken = useCallback(
    (nextToken) => {
      if (!nextToken) {
        clearSession();
        setAuthLoading(false);
        return;
      }

      localStorage.setItem("token", nextToken);
      setToken(nextToken);
      setAuthLoading(true);
    },
    [clearSession],
  );

  const refreshCurrentUser = useCallback(
    async (tokenOverride) => {
      const activeToken = tokenOverride || token;

      if (!activeToken) {
        setCurrentUser(null);
        setAuthLoading(false);
        return null;
      }

      setAuthLoading(true);

      try {
        const [response, jabatanList] = await Promise.all([
          getMe(),
          listJabatan().catch(() => []),
        ]);
        const user = normalizeUserPayload(response);

        if (!user) {
          clearSession();
          return null;
        }

        const enrichedUser = enrichUserJabatan(user, jabatanList);

        setCurrentUser(enrichedUser);
        return enrichedUser;
      } catch {
        clearSession();
        return null;
      } finally {
        setAuthLoading(false);
      }
    },
    [clearSession, token],
  );

  const logoutUser = useCallback(async () => {
    try {
      await logout();
    } catch {
      // Ignore API logout failure and clear local session anyway.
    } finally {
      clearSession();
      setAuthLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    refreshCurrentUser();
  }, [refreshCurrentUser]);

  const value = useMemo(
    () => ({
      token,
      currentUser,
      authLoading,
      isAuthenticated: Boolean(token),
      setAuthToken,
      refreshCurrentUser,
      logoutUser,
    }),
    [
      authLoading,
      currentUser,
      logoutUser,
      refreshCurrentUser,
      setAuthToken,
      token,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
