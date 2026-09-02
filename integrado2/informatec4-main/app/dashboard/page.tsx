'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PostsList from '../components/PostsList';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

interface User {
  id: string;
  nombre: string;
  apellido: string;
  curso: string | null;
  division: string | null;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('published');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    // Agregar fuente Encode Sans Condensed desde Google Fonts (estilo Tecnica4DL)
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://fonts.googleapis.com/css2?family=Encode+Sans+Condensed:wght@300;400;600;700;900&display=swap';
    document.head.appendChild(linkElement);

    // Aplicar la fuente Encode Sans Condensed a todo el sitio
    document.body.style.fontFamily = "'Encode Sans Condensed', Arial, sans-serif";
    
    // Agregar detector de scroll para efectos en la navegación
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);

    const fetchUserProfile = async () => {
      try {
        console.log('Obteniendo perfil de usuario...');
        const response = await fetch('/api/users/me');
        console.log('Respuesta:', response.status, response.statusText);
        
        // Intentar obtener el texto de la respuesta para debug
        const responseText = await response.text();
        console.log('Respuesta completa:', responseText);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Si no está autenticado, redirigir al login
            console.log('No autorizado, redirigiendo a login');
            router.push('/login');
            return;
          }
          throw new Error(`Error al obtener perfil: ${response.status} ${responseText}`);
        }
        
        // Convierte el texto de respuesta de nuevo a JSON
        const userData = JSON.parse(responseText);
        console.log('Datos de usuario:', userData);
        setUser(userData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('Error completo:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Error al cerrar sesión');
      }
      
      // Redirigir al login después de cerrar sesión
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-4 border-t-blue-600 border-blue-100 animate-spin"></div>
            <div className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-t-4 border-t-indigo-500 border-indigo-50 animate-spin animation-delay-150"></div>
          </div>
          <p className="mt-6 text-indigo-800 font-semibold text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
      case 'EDITOR':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default:
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'EDITOR':
        return 'Editor';
      default:
        return 'Estudiante';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Navbar con efecto de scroll */}
      <header 
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white shadow-lg py-2' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex">
              <Link href="/" className="flex items-center space-x-2">
                <span className={`text-2xl font-extrabold ${isScrolled ? 'text-blue-700' : 'text-white'}`}>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                    INFORMATEC
                  </span>
                </span>
                <motion.span 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, 0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
                  className="text-2xl"
                >
                  📑
                </motion.span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="hidden md:flex items-center">
                  <span className={`${isScrolled ? 'text-gray-700' : 'text-white'} font-medium`}>
                    ¡Hola, {user.nombre}!
                  </span>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm mb-6"
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {user && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Profile section - Perfil destacado al estilo moderno */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="md:col-span-4 space-y-6"
            >
              {/* User profile card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-80">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                  <div className="absolute -bottom-16 inset-x-0 flex justify-center">
                    <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                      <div className="h-full w-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <span className="text-5xl">{user.nombre.charAt(0)}{user.apellido.charAt(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-16 pb-6 px-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{user.nombre} {user.apellido}</h2>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-500">{user.email}</p>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 gap-3">
                      {user.curso && user.division && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Curso y División</p>
                            <p className="text-sm text-gray-500">{user.curso} {user.division}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Miembro desde</p>
                          <p className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick actions */}
              {(user.role === 'ADMIN' || user.role === 'EDITOR') && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-80"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">
                      Acciones Rápidas
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <Link href="/posts/new">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                      >
                        <div className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-2 mr-4">
                          <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Crear Nueva Publicación</h4>
                          <p className="text-xs text-gray-500">Añade una noticia al portal</p>
                        </div>
                      </motion.div>
                    </Link>
                    
                    {user.role === 'ADMIN' && (
                      <Link href="/categories">
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                        >
                          <div className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-2 mr-4">
                            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Gestionar Categorías</h4>
                            <p className="text-xs text-gray-500">Organiza el contenido del portal</p>
                          </div>
                        </motion.div>
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Main content area */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-8"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-80">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">
                    Noticias
                  </h3>
                </div>
                
                {/* Tabs for content filtering */}
                {(user.role === 'ADMIN' || user.role === 'EDITOR') ? (
                  <div className="border-b border-gray-100">
                    <nav className="-mb-px flex" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('published')}
                        className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'published'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } transition-all duration-200`}
                      >
                        Publicadas
                      </button>
                      <button
                        onClick={() => setActiveTab('drafts')}
                        className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'drafts'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } transition-all duration-200`}
                      >
                        Borradores
                      </button>
                    </nav>
                  </div>
                ) : null}
                
                <div className="p-6">
                  {activeTab === 'published' && (
                    <PostsList
                      isAdmin={user.role === 'ADMIN' || user.role === 'EDITOR'}
                      queryParams={{ published: 'true' }}
                    />
                  )}
                  
                  {activeTab === 'drafts' && (
                    <PostsList
                      isAdmin={user.role === 'ADMIN' || user.role === 'EDITOR'}
                      queryParams={{ published: 'false' }}
                    />
                  )}
                </div>
              </div>
              
              {/* Admin panel */}
              {user.role === 'ADMIN' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-80"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">
                      Panel de Administración
                    </h3>
                    <p className="text-sm text-blue-100">
                      Herramientas avanzadas de gestión
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <motion.div 
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                        className="border border-gray-200 rounded-lg p-4 transition-all duration-200 bg-gradient-to-br from-white to-blue-50"
                      >
                        <Link href="#" className="block">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-medium text-gray-900">Gestionar Usuarios</h4>
                              <p className="text-sm text-gray-500">Administrar cuentas y permisos</p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                        className="border border-gray-200 rounded-lg p-4 transition-all duration-200 bg-gradient-to-br from-white to-blue-50"
                      >
                        <Link href="#" className="block">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-medium text-gray-900">Estadísticas</h4>
                              <p className="text-sm text-gray-500">Ver métricas del portal</p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </main>

      <Footer />
      
      {/* Elementos decorativos flotantes */}
      <div className="fixed top-20 left-10 w-40 h-40 bg-blue-400 opacity-5 rounded-full filter blur-3xl animate-blob"></div>
      <div className="fixed top-40 right-20 w-60 h-60 bg-indigo-400 opacity-5 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-10 left-1/3 w-40 h-40 bg-purple-300 opacity-5 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      
      {/* Estilos globales para animaciones */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
}