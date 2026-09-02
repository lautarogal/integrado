'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

interface Author {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}
// TEST
interface Category {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  pageLayout: string;
  pageTheme: string;
  author: Author;
  categories: Category[];
  comments: Comment[];
  _count: {
    likes: number;
  };
  userLiked?: boolean;
}

// Eliminamos la interfaz PostDetailPageProps y usamos useParams en su lugar

export default function PostDetailPage() {
  const params = useParams(); // Usamos el hook useParams para obtener los parámetros de la URL
  const slug = params?.slug as string; // Obtenemos el slug desde params
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [likeCount, setLikeCount] = useState<number>(0);
  const [userLiked, setUserLiked] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>('');
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/users/me');
        
        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    
    checkAuth();
  }, []);

  // Cargar la publicación
  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return; // Verificar que el slug existe
      
      setLoading(true);
      try {
        const response = await fetch(`/api/posts/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Publicación no encontrada');
          } else {
            throw new Error('Error al cargar la publicación');
          }
        }
        
        const postData = await response.json();
        setPost(postData);
        setLikeCount(postData._count.likes);
        setUserLiked(postData.userLiked || false);
      } catch (err) {
        console.error('Error al cargar la publicación:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [slug]);

  // Manejar like
  const handleLike = async () => {
    if (!isAuthenticated) {
      // Redirigir a login si no está autenticado
      router.push('/login');
      return;
    }
    
    try {
      const response = await fetch(`/api/posts/${post?.slug}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Error al procesar like');
      }
      
      const data = await response.json();
      setLikeCount(data.likeCount);
      setUserLiked(data.liked);
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  // Manejar comentario
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Redirigir a login si no está autenticado
      router.push('/login');
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }
    
    setCommentLoading(true);
    
    try {
      const response = await fetch(`/api/posts/${post?.slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (!response.ok) {
        throw new Error('Error al agregar comentario');
      }
      
      // Actualizar comentarios
      const data = await response.json();
      
      if (post) {
        setPost({
          ...post,
          comments: [data.comment, ...post.comments],
        });
      }
      
      setNewComment('');
    } catch (error) {
      console.error('Error al comentar:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Formatear tiempo relativo
  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: es,
    });
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <svg className="h-12 w-12 text-red-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">{error}</h3>
                <div className="mt-6">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#3d4fd6] hover:bg-[#5e84ff]"
                  >
                    Volver al Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <svg className="h-12 w-12 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Publicación no encontrada</h3>
                <div className="mt-6">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#3d4fd6] hover:bg-[#5e84ff]"
                  >
                    Volver al Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    colorful: 'bg-gradient-to-r from-purple-50 to-blue-50 text-gray-900',
  };

  const layoutClasses = {
    default: 'max-w-3xl',
    wide: 'max-w-4xl',
    sidebar: 'max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8',
    fullwidth: 'max-w-full',
  };

  const theme = post.pageTheme as keyof typeof themeClasses;
  const layout = post.pageLayout as keyof typeof layoutClasses;

  return (
    <div className={`min-h-screen ${themeClasses[theme]} py-12`}>
      {/* Navbar */}
      <nav className="bg-[#3d4fd6] shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-white">Portal de Noticias Escolar</h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-white hover:text-gray-200"
              >
                Dashboard
              </Link>
              
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#3d4fd6] bg-white hover:bg-gray-100"
                >
                  Iniciar Sesión
                </Link>
              ) : (
                <span className="text-white">{user?.nombre}</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className={`mx-auto px-4 sm:px-6 lg:px-8 pt-8 ${layoutClasses[layout]}`}>
        {/* Article content */}
        <article className={layout === 'sidebar' ? 'col-span-2' : ''}>
          {/* Cover image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg mb-8">
            <img
              src={post.coverImage || 'https://via.placeholder.com/1200x630?text=Noticia+Escolar'}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>{formatDate(post.createdAt)}</span>
              <span>•</span>
              <span>Por {post.author.nombre} {post.author.apellido}</span>
              {!post.published && (
                <>
                  <span>•</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Borrador
                  </span>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((cat) => (
                <Link
                  key={cat.category.id}
                  href={`/categories/${cat.category.slug}`}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded hover:bg-blue-200"
                >
                  {cat.category.name}
                </Link>
              ))}
            </div>
            
            <p className="text-xl text-gray-500 dark:text-gray-400 leading-8">
              {post.description}
            </p>
          </div>

          {/* Article content */}
          <div className="prose prose-lg max-w-none dark:prose-invert mb-10">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Article footer */}
          <div className="flex items-center justify-between border-t border-b py-4 border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 text-sm focus:outline-none ${
                  userLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <svg
                  className={`h-5 w-5 ${
                    userLiked ? 'text-red-500 fill-red-500' : 'text-gray-500 dark:text-gray-400'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                <span>{likeCount}</span>
              </button>
              
              <button
                onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 focus:outline-none"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
                <span>{post.comments.length} comentarios</span>
              </button>
            </div>
            
            {/* Edit button for author/admin */}
            {isAuthenticated && (user?.id === post.author.id || user?.role === 'ADMIN') && (
              <Link
                href={`/posts/${post.slug}/edit`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#3d4fd6] hover:bg-[#5e84ff]"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Editar
              </Link>
            )}
          </div>

          {/* Comments section */}
          <div id="comments" className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Comentarios</h2>
            
            {/* New comment form */}
            {isAuthenticated ? (
              <form onSubmit={handleComment} className="mb-8">
                <div className="mb-4">
                  <label htmlFor="comment" className="sr-only">
                    Comentario
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    className="shadow-sm block w-full focus:ring-[#3d4fd6] focus:border-[#3d4fd6] sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={commentLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#3d4fd6] hover:bg-[#5e84ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d4fd6]"
                  >
                    {commentLoading ? 'Enviando...' : 'Comentar'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-8">
                <p className="text-gray-700 dark:text-gray-300">
                  <Link href="/login" className="text-[#3d4fd6] hover:underline">
                    Inicia sesión
                  </Link>{' '}
                  para dejar un comentario.
                </p>
              </div>
            )}
            
            {/* Comments list */}
            {post.comments.length > 0 ? (
              <ul className="space-y-6">
                {post.comments.map((comment) => (
                  <li key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex space-x-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-800">
                            {comment.user.nombre} {comment.user.apellido}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(comment.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Aún no hay comentarios. ¡Sé el primero en comentar!
                </p>
              </div>
            )}
          </div>
        </article>

        {/* Sidebar */}
        {layout === 'sidebar' && (
          <aside className="col-span-1 space-y-8">
            {/* Author info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Autor</h3>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-[#3d4fd6] flex items-center justify-center text-white">
                  {post.author.nombre.charAt(0)}
                  {post.author.apellido.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">
                    {post.author.nombre} {post.author.apellido}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Categories */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Categorías</h3>
              <div className="flex flex-wrap gap-2">
                {post.categories.map((cat) => (
                  <Link
                    key={cat.category.id}
                    href={`/categories/${cat.category.slug}`}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded hover:bg-blue-200"
                  >
                    {cat.category.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
