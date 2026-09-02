'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState<string>('');

  // Verificar si el usuario es administrador
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/users/me');
        
        if (!response.ok) {
          // Si no está autenticado, redirigir al login
          router.push('/login');
          return;
        }
        
        const userData = await response.json();
        
        if (userData.role !== 'ADMIN') {
          // Si no es admin, redirigir al dashboard
          router.push('/dashboard');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isAdmin) return;
      
      setLoading(true);
      try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Error al cargar categorías');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setError('Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchCategories();
    }
  }, [isAdmin]);

  // Manejar creación de categoría
  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear categoría');
      }
      
      setSuccess('Categoría creada exitosamente');
      setNewCategoryName('');
      setCategories([...categories, data.category]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar edición de categoría
  const handleEditCategory = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory || !editName.trim()) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`/api/categories/${editingCategory.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar categoría');
      }
      
      setSuccess('Categoría actualizada exitosamente');
      
      // Actualizar lista de categorías
      setCategories(
        categories.map((category) =>
          category.id === editingCategory.id ? data.category : category
        )
      );
      
      // Resetear estado de edición
      setEditingCategory(null);
      setEditName('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar eliminación de categoría
  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/categories/${category.slug}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        
        if (response.status === 400 && data.postsCount) {
          throw new Error(`No se puede eliminar esta categoría porque tiene ${data.postsCount} publicaciones asociadas.`);
        }
        
        throw new Error(data.error || 'Error al eliminar categoría');
      }
      
      setSuccess('Categoría eliminada exitosamente');
      
      // Actualizar lista de categorías
      setCategories(categories.filter((cat) => cat.id !== category.id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d4fd6] mx-auto"></div>
          <p className="mt-4 text-[#3d4fd6]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-[#3d4fd6] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <Link href="/dashboard" className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-white">Portal de Noticias Escolar</h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#3d4fd6] bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
              >
                Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Categorías existentes */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="bg-[#3d4fd6] px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-white">
                  Categorías existentes
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-200">
                  Lista de categorías disponibles
                </p>
              </div>
              <div className="p-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm-1-5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {editingCategory ? (
                  <form onSubmit={handleEditCategory} className="mb-6 p-4 border border-gray-200 rounded-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Editar categoría</h3>
                    <div className="mb-4">
                      <label htmlFor="editName" className="block text-sm font-medium text-gray-700">
                        Nombre de la categoría
                      </label>
                      <input
                        type="text"
                        id="editName"
                        name="editName"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1 focus:ring-[#3d4fd6] focus:border-[#3d4fd6] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setEditName('');
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d4fd6]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#3d4fd6] hover:bg-[#5e84ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d4fd6]"
                      >
                        {submitting ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </form>
                ) : null}
                
                {categories.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {categories.map((category) => (
                      <li key={category.id} className="py-4 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                          {category._count && (
                            <p className="text-sm text-gray-500">
                              {category._count.posts} publicaciones
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(category);
                              setEditName(category.name);
                            }}
                            className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d4fd6]"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category)}
                            className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No hay categorías disponibles</p>
                  </div>
                )}
              </div>
            </div>

            {/* Crear nueva categoría */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="bg-[#3d4fd6] px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-white">
                  Crear nueva categoría
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-200">
                  Añadir una nueva categoría para clasificar publicaciones
                </p>
              </div>
              <div className="p-6">
                <form onSubmit={handleCreateCategory}>
                  <div className="mb-4">
                    <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700">
                      Nombre de la categoría
                    </label>
                    <input
                      type="text"
                      id="newCategoryName"
                      name="newCategoryName"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="mt-1 focus:ring-[#3d4fd6] focus:border-[#3d4fd6] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#3d4fd6] hover:bg-[#5e84ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d4fd6]"
                    >
                      {submitting ? 'Creando...' : 'Crear categoría'}
                    </button>
                  </div>
                </form>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Consejos para categorías</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                    <li>Utiliza nombres claros y descriptivos para las categorías</li>
                    <li>Evita categorías demasiado generales o demasiado específicas</li>
                    <li>Las categorías ayudan a los usuarios a encontrar contenido similar</li>
                    <li>No crees categorías duplicadas con nombres similares</li>
                    <li>Las categorías se pueden utilizar para filtrar publicaciones</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}