'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostFormData {
  title: string;
  description: string;
  content: string;
  coverImage: string;
  published: boolean;
  categories: string[];
  pageLayout: string;
  pageTheme: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    description: '',
    content: '',
    coverImage: '',
    published: false,
    categories: [],
    pageLayout: 'default',
    pageTheme: 'light',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Obtener categorías al cargar la página
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Error al cargar categorías');
        }
        
        const categoriesData = await response.json();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        setError('No se pudieron cargar las categorías');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        categories: [...formData.categories, value],
      });
    } else {
      setFormData({
        ...formData,
        categories: formData.categories.filter(id => id !== value),
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la publicación');
      }

      setSuccess('Publicación creada exitosamente!');
      
      // Redirigir después de un breve tiempo
      setTimeout(() => {
        router.push(`/posts/${data.post.slug}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-[#3d4fd6]">
              <h3 className="text-lg leading-6 font-medium text-white">
                Crear Nueva Publicación
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-200">
                Crea una nueva noticia o artículo para el portal escolar
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm-1-5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 my-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      {success}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Título */}
                  <div className="sm:col-span-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className="shadow-sm focus:ring-[#3d4fd6] focus:border-[#3d4fd6] block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descripción (resumen breve) <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        required
                        className="shadow-sm focus:ring-[#3d4fd6] focus:border-[#3d4fd6] block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Breve descripción que aparece en los listados
                    </p>
                  </div>

                  {/* Contenido */}
                  <div className="sm:col-span-6">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Contenido <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="content"
                        name="content"
                        rows={10}
                        required
                        className="shadow-sm focus:ring-[#3d4fd6] focus:border-[#3d4fd6] block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.content}
                        onChange={handleChange}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Contenido principal de la publicación. Puedes usar Markdown para formatear el texto.
                    </p>
                  </div>

                  {/* Imagen de portada */}
                  <div className="sm:col-span-6">
                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                      URL de imagen de portada
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        name="coverImage"
                        id="coverImage"
                        className="shadow-sm focus:ring-[#3d4fd6] focus:border-[#3d4fd6] block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.coverImage}
                        onChange={handleChange}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      URL de la imagen de portada. Si se deja en blanco, se usará una imagen predeterminada.
                    </p>
                  </div>

                  {/* Categorías */}
                  <div className="sm:col-span-6">
                    <fieldset>
                      <legend className="block text-sm font-medium text-gray-700">Categorías</legend>
                      <div className="mt-2 space-y-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4">
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <div key={category.id} className="relative flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id={`category-${category.id}`}
                                  name={`category-${category.id}`}
                                  type="checkbox"
                                  value={category.id}
                                  checked={formData.categories.includes(category.id)}
                                  onChange={handleCategoryChange}
                                  className="focus:ring-[#3d4fd6] h-4 w-4 text-[#3d4fd6] border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor={`category-${category.id}`} className="font-medium text-gray-700">
                                  {category.name}
                                </label>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No hay categorías disponibles</p>
                        )}
                      </div>
                    </fieldset>
                  </div>

                  {/* Opciones de publicación */}
                  <div className="sm:col-span-3">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="published"
                          name="published"
                          type="checkbox"
                          checked={formData.published}
                          onChange={handleChange}
                          className="focus:ring-[#3d4fd6] h-4 w-4 text-[#3d4fd6] border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="published" className="font-medium text-gray-700">
                          Publicar inmediatamente
                        </label>
                        <p className="text-gray-500">
                          Si no está marcado, se guardará como borrador
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Diseño de página */}
                  <div className="sm:col-span-3">
                    <label htmlFor="pageLayout" className="block text-sm font-medium text-gray-700">
                      Diseño de página
                    </label>
                    <select
                      id="pageLayout"
                      name="pageLayout"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#3d4fd6] focus:border-[#3d4fd6] sm:text-sm rounded-md"
                      value={formData.pageLayout}
                      onChange={handleChange}
                    >
                      <option value="default">Predeterminado</option>
                      <option value="wide">Ancho</option>
                      <option value="sidebar">Con barra lateral</option>
                      <option value="fullwidth">Ancho completo</option>
                    </select>
                  </div>

                  {/* Tema de página */}
                  <div className="sm:col-span-3">
                    <label htmlFor="pageTheme" className="block text-sm font-medium text-gray-700">
                      Tema de página
                    </label>
                    <select
                      id="pageTheme"
                      name="pageTheme"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#3d4fd6] focus:border-[#3d4fd6] sm:text-sm rounded-md"
                      value={formData.pageTheme}
                      onChange={handleChange}
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                      <option value="colorful">Colorido</option>
                    </select>
                  </div>

                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <Link
                      href="/dashboard"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d4fd6]"
                    >
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#3d4fd6] hover:bg-[#5e84ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d4fd6]"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </>
                      ) : 'Guardar Publicación'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}