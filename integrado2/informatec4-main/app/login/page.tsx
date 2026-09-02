'use client';

import { useState, FormEvent, ChangeEvent, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

// Componente separado para manejar searchParams
function RegisteredMessage() {
  // Movemos useSearchParams a un componente separado
  const { useSearchParams } = require('next/navigation'); // Importación dinámica
  const searchParams = useSearchParams();
  const registered = searchParams?.get('registered');

  if (!registered) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg shadow-sm" 
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="font-medium">¡Registro exitoso!</p>
          <p className="text-sm">Ya puedes iniciar sesión con tus credenciales.</p>
        </div>
      </div>
    </motion.div>
  );
}

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Agregar fuente Encode Sans Condensed desde Google Fonts (estilo Tecnica4DL)
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://fonts.googleapis.com/css2?family=Encode+Sans+Condensed:wght@300;400;600;700;900&display=swap';
    document.head.appendChild(linkElement);

    // Aplicar la fuente Encode Sans Condensed a todo el sitio
    document.body.style.fontFamily = "'Encode Sans Condensed', Arial, sans-serif";
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Login: Enviando solicitud de inicio de sesión');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        // Importante: asegurarse de que las cookies se incluyan y sean establecidas
        credentials: 'include'
      });

      console.log('Login: Respuesta recibida:', response.status, response.statusText);
      
      // Obtener el texto completo de la respuesta para depuración
      const responseText = await response.text();
      console.log('Login: Texto de la respuesta:', responseText);
      
      // Parsear el JSON manualmente
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Login: Datos parseados:', data);
      } catch (parseError) {
        console.error('Login: Error al parsear JSON:', parseError);
        throw new Error('Error de formato en la respuesta del servidor');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Ver las cookies establecidas (solo para depuración)
      console.log('Login: Cookies después de login:', document.cookie);

      // Redirigir al usuario a la página principal después del login exitoso
      console.log('Login: Redirigiendo a dashboard...');
      router.push('/dashboard');
    } catch (err) {
      console.error('Login: Error completo:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center">
              <Link href="/" className="inline-block">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                    INFORMATEC
                  </span>
                  <motion.span 
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 10, 0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
                    className="text-2xl"
                  >
                    📑
                  </motion.span>
                </div>
              </Link>
              <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                Inicia sesión en tu cuenta
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Accede a todas las noticias y funcionalidades de la plataforma
              </p>
            </div>
            
            {/* Envolvemos el componente que usa searchParams en Suspense */}
            <Suspense fallback={null}>
              <RegisteredMessage />
            </Suspense>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm" 
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
            
            <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-80">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Iniciando sesión...</span>
                      </div>
                    ) : (
                      <span>Iniciar sesión</span>
                    )}
                  </motion.button>
                </div>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <Link 
                    href="/register" 
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Link 
                href="/"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a la página principal
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
      
      {/* Elementos decorativos flotantes */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-blue-400 opacity-5 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute top-40 right-20 w-60 h-60 bg-indigo-400 opacity-5 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-purple-300 opacity-5 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      
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
      `}</style>
    </div>
  );
}