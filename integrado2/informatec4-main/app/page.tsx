'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PostsList from './components/PostsList';
import Footer from './components/Footer'
import { motion } from 'framer-motion';
import Head from 'next/head';

interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
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
        const response = await fetch('/api/users/me');
        if (!response.ok) {
          if (response.status === 401) {
            setUser(null);
            return;
          }
          throw new Error('Error al obtener perfil');
        }
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
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
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
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

  return (
    <>
      <Head>
        <title>Informatec - Portal de Noticias Escolar</title>
        <meta name="description" content="Portal de noticias y eventos de la comunidad educativa" />
      </Head>
      
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
                    <span className={`bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent ${isScrolled ? 'text-blue-700' : 'text-white'}`}>
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
                {user ? (
                  <>
                    <span className={`${isScrolled ? 'text-gray-700' : 'text-white'} font-medium`}>
                      ¡Hola, {user.nombre}!
                    </span>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero section con efecto parallax y elementos decorativos */}
        <main className="flex-grow">
          <div className="relative overflow-hidden">
            {/* Hero background con gradiente y elementos gráficos */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-indigo-700 to-blue-900 h-screen-75 min-h-[500px]">
              {/* Elementos decorativos flotantes */}
              <div className="absolute top-20 left-10 w-40 h-40 bg-blue-400 opacity-10 rounded-full filter blur-3xl animate-blob"></div>
              <div className="absolute top-40 right-20 w-60 h-60 bg-indigo-400 opacity-10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-purple-300 opacity-10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>
            
            {/* Contenido Hero */}
            <div className="relative pt-36 pb-16 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl tec-text-glow">
                  <span className="block">¡Informatec!</span>
                  <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400">
                    Las noticias de la técnica
                  </span>
                </h1>
                <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                  Un espacio digital para compartir las últimas novedades, eventos y logros 
                  de nuestra comunidad educativa.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-blue-700 bg-white hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                    >
                      Ir al panel de control
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-blue-700 bg-white hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                      >
                        Acceder al Portal
                      </Link>
                      <Link
                        href="/register"
                        className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-blue-600 bg-opacity-20 hover:bg-opacity-30 backdrop-filter backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                      >
                        Crear una Cuenta
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
              
              {/* Scroll indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-white text-3xl opacity-70"
                >
                  ↓
                </motion.div>
              </div>
            </div>
          </div>
          


          {/* Posts section */}
          <div className="bg-white -mt-8 pb-16">
            <div className="max-w-7xl mx-auto py-10 px-4 sm:py-12 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Noticias</h2>
                  <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
                    Últimas publicaciones
                  </p>
                </motion.div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <button 
                    onClick={toggleViewMode}
                    className={`inline-flex items-center p-2 border rounded-md ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } transition-all duration-200`}
                    title="Vista de lista"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button 
                    onClick={toggleViewMode}
                    className={`inline-flex items-center p-2 border rounded-md ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } transition-all duration-200`}
                    title="Vista de cuadrícula"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-8">
                <PostsList
                  isAdmin={user?.role === 'ADMIN' || user?.role === 'EDITOR'}
                  viewMode={viewMode}
                  queryParams={{ published: 'true' }}
                />
              </div>
            </div>
          </div>
          
          {/* Features section */}
          <div className="bg-gradient-to-b from-white to-gray-50 py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Características</h2>
                <p className="mt-1 text-3xl font-bold text-gray-900 sm:text-4xl sm:tracking-tight">
                  Todo lo que necesitas para mantenerte informado
                </p>
              </motion.div>

              <div className="mt-16 grid gap-10 grid-cols-1 md:grid-cols-3">
                {/* Feature 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300"
                >
                  <div className="pt-10 pb-8 px-6">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-7 text-center">
                      <h3 className="text-xl font-semibold text-gray-900">Noticias Actualizadas</h3>
                      <p className="mt-3 text-base text-gray-500 leading-relaxed">
                        Mantente al día con las últimas novedades y eventos de la escuela en tiempo real.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300"
                >
                  <div className="pt-10 pb-8 px-6">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-7 text-center">
                      <h3 className="text-xl font-semibold text-gray-900">Comunidad Estudiantil</h3>
                      <p className="mt-3 text-base text-gray-500 leading-relaxed">
                        Interactúa con publicaciones a través de comentarios y likes, conectando con toda la comunidad.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 3 */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300"
                >
                  <div className="pt-10 pb-8 px-6">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-7 text-center">
                      <h3 className="text-xl font-semibold text-gray-900">Acceso Seguro</h3>
                      <p className="mt-3 text-base text-gray-500 leading-relaxed">
                        Sistema de autenticación avanzado para proteger tu información y personalizar tu experiencia.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:flex lg:items-center lg:justify-between">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true }}
                  className="lg:w-0 lg:flex-1"
                >
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    ¿Listo para unirte a nuestra comunidad?
                  </h2>
                  <p className="mt-4 max-w-3xl text-lg text-blue-100">
                    Crea una cuenta hoy y comienza a compartir tus ideas con toda la escuela.
                  </p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="mt-8 lg:mt-0 lg:ml-8"
                >
                  <div className="rounded-md shadow">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-blue-700 bg-white hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Regístrate ahora
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer moderno */}
        <Footer/>
      </div>
      
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
        
        .h-screen-75 {
          height: 75vh;
        }
      `}</style>
    </>
  );
}