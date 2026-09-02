'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Author {
  id: string;
  nombre: string;
  apellido: string;
}

interface Category {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  published: boolean;
  createdAt: string;
  author: Author;
  categories: Category[];
  _count: {
    comments: number;
    likes: number;
  };
}

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface PostsListProps {
  isAdmin?: boolean;
  viewMode?: 'list' | 'grid';
  queryParams?: {
    published?: string;
    category?: string;
    search?: string;
  };
}

export default function PostsList({ 
  isAdmin = false, 
  viewMode = 'list',
  queryParams = {} 
}: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const previousQueryParams = useRef<string>('');
  const isInitialMount = useRef<boolean>(true);

  const buildUrl = (page: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pagination.limit.toString(),
      ...queryParams,
    });
    
    return `/api/posts?${params.toString()}`;
  };

  const fetchPosts = async (page: number = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const url = buildUrl(page);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al cargar publicaciones');
      }
      
      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
      setError('No se pudieron cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentQueryString = JSON.stringify(queryParams);
    
    if (isInitialMount.current) {
      fetchPosts();
      previousQueryParams.current = currentQueryString;
      isInitialMount.current = false;
    } else if (previousQueryParams.current !== currentQueryString) {
      fetchPosts();
      previousQueryParams.current = currentQueryString;
    }
  }, [JSON.stringify(queryParams)]);
  
  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d4fd6]"></div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay publicaciones</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron publicaciones con los filtros actuales.
        </p>
        {isAdmin && (
          <div className="mt-6">
            <Link
              href="/posts/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3d4fd6] hover:bg-[#5e84ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d4fd6] transition-colors duration-200"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Crear Nueva Publicación
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {viewMode === 'list' && (
        <div className="flow-root mt-6">
          <ul className="-my-5 divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post.id} className="py-5">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img 
                      className="h-12 w-12 rounded-lg object-cover" 
                      src={post.coverImage || "https://via.placeholder.com/150?text=Noticia"} 
                      alt={post.title} 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      {!post.published && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Borrador
                        </span>
                      )}
                      {post.categories.length > 0 && post.categories.slice(0, 2).map((cat) => (
                        <span key={cat.category.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cat.category.name}
                        </span>
                      ))}
                      {post.categories.length > 2 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{post.categories.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <Link href={`/posts/${post.slug}`} className="text-lg font-medium text-[#3d4fd6] hover:underline">
                        {post.title}
                      </Link>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {post.description}
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(post.createdAt)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {post.author.nombre} {post.author.apellido}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post._count.comments}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post._count.likes}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex-shrink-0 self-center flex">
                      <div className="relative inline-block text-left">
                        <div>
                          <Link
                            href={`/posts/${post.slug}/edit`}
                            className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-[#3d4fd6] hover:bg-[#5e84ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d4fd6]"
                          >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      

      {viewMode === 'grid' && (
        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <Link href={`/posts/${post.slug}`} className="block">
                  <div className="relative h-48">
                    <img 
                      className="w-full h-full object-cover" 
                      src={post.coverImage || "https://via.placeholder.com/400x300?text=Noticia"} 
                      alt={post.title} 
                    />
                    {!post.published && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Borrador
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.categories.length > 0 && post.categories.slice(0, 2).map((cat) => (
                        <span key={cat.category.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cat.category.name}
                        </span>
                      ))}
                      {post.categories.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{post.categories.length - 2}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-[#3d4fd6] hover:text-[#5e84ff] line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {post.description}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post._count.comments}
                        </div>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post._count.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                {isAdmin && (
                  <div className="px-4 pb-4 flex justify-end">
                    <Link
                      href={`/posts/${post.slug}/edit`}
                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-[#3d4fd6] hover:bg-[#5e84ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d4fd6]"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      

      {pagination.pages > 1 && (
        <nav className="border-t border-gray-200 px-4 flex items-center justify-between sm:px-0 mt-6">
          <div className="-mt-px w-0 flex-1 flex">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`border-t-2 border-transparent pt-4 pr-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 ${
                pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Anterior
            </button>
          </div>
          <div className="hidden md:-mt-px md:flex">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium ${
                  pagination.page === page
                    ? 'border-[#3d4fd6] text-[#3d4fd6]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <div className="-mt-px w-0 flex-1 flex justify-end">
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={`border-t-2 border-transparent pt-4 pl-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 ${
                pagination.page === pagination.pages ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Siguiente
              <svg className="ml-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
