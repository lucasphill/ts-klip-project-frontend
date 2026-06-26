import { useAuth0, User } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from "react";
import { setAuth0Client } from "../services/api";

interface AuthContextType {
  user: User | null;
  permissions: string[];
  loading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const auth0 = useAuth0();
  const {
    user: auth0User,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: logoutWithRedirect,
    getAccessTokenSilently,
  } = auth0;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Set Auth0 client for API service
  useEffect(() => {
    setAuth0Client(auth0);
  }, [auth0]);

  // Initialize user data when Auth0 authentication state changes
  useEffect(() => {
    const initializeUser = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const token = await getAccessTokenSilently();
          const { permissions: perms = [] } = jwtDecode<{ permissions?: string[] }>(token);
          setPermissions(perms);
          setUser(auth0User);
          // Try to get user from our backend
          // const userData = await authApi.getCurrentUser();
          // setUser(userData);
        } catch (error) {
          // If user doesn't exist in our backend (404), create them.
          // Other errors (like missing token) should be logged.
          const err = error as any;
          if (err.response?.status === 404) {
            try {
              // const userData = await authApi.createUser(auth0User);
              // setUser(userData);
            } catch (createError) {
              console.error('Failed to create user:', createError);
              logout();
            }
          } else {
            console.error('Failed to get current user:', error);
            logout();
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    if (!isLoading) {
      initializeUser();
    }
  }, [isAuthenticated, auth0User, isLoading]);

  const login = () => {
    loginWithRedirect();
  }

  const logout = () => {
    logoutWithRedirect({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }

  const refreshUser = async () => {
    try {
      // const userData = await authApi.getCurrentUser();
      // setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    permissions,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;