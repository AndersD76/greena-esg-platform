import { createContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginData, RegisterData } from '../services/auth.service';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (data: LoginData) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@greena:token');
    if (token) {
      authService
        .getProfile()
        .then((userData) => setUser(userData))
        .catch(() => {
          localStorage.removeItem('@greena:token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function signIn({ email, password }: LoginData) {
    const response = await authService.login({ email, password });
    const { user: userData, accessToken } = response;

    localStorage.setItem('@greena:token', accessToken);
    setUser(userData);
  }

  async function signUp(data: RegisterData) {
    const response = await authService.register(data);
    const { user: userData, accessToken } = response;

    localStorage.setItem('@greena:token', accessToken);
    setUser(userData);
  }

  function signOut() {
    localStorage.removeItem('@greena:token');
    setUser(null);
  }

  async function updateUser(data: Partial<User>) {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
