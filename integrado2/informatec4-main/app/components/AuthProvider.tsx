'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  nombre: string;
  apellido: string;
  curso: string | null;
  division: string | null;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Verificar si el usuario está autenticado al cargar el componente
  // Verificar si el usuario está autenticado al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthProvider: Verificando autenticación...');
        const response = await fetch('/api/users/me');
        console.log('AuthProvider: Respuesta de API:', response.status, response.statusText);
        
        // Obtener el contenido de la respuesta para debugging
        const responseText = await response.text();
        console.log('AuthProvider: Contenido de la respuesta:', responseText);
        
        if (response.ok) {
          try {
            const userData = JSON.parse(responseText);
            console.log('AuthProvider: Usuario autenticado:', userData);
            setUser(userData);
          } catch (parseError) {
            console.error('AuthProvider: Error al parsear JSON:', parseError);
            console.log('AuthProvider: Texto que causó el error:', responseText);
          }
        } else {
          console.log('AuthProvider: Error en la autenticación:', response.status);
          // Si hay un error 401, significa que no está autenticado
          if (response.status === 401) {
            console.log('AuthProvider: Usuario no autenticado (401)');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('AuthProvider: Error al verificar autenticación:', err);
      } finally {
        console.log('AuthProvider: Finalizando verificación de autenticación');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
      
      setUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Error al cerrar sesión');
      }
      
      setUser(null);
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}