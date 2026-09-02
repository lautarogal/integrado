// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, JWTVerifyResult } from 'jose';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function middleware(request: NextRequest) {
  console.log('Middleware ejecutándose para la ruta:', request.nextUrl.pathname);

  // Las peticiones OPTIONS son necesarias para permitir que Tecnica4DL
  // consulte la API de noticias desde otro puerto/origen durante el desarrollo.
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
      },
    });
  }

  const token = request.cookies.get('token')?.value;
  console.log('Token presente:', !!token);

  // Rutas que requieren autenticación (cualquier usuario)
  const authRoutes = [
    '/dashboard',
    '/profile',
    '/api/users/me',
    '/api/likes',
    '/api/comments',
    // Note: /api/posts is handled separately below
  ];

  // Rutas que requieren ser administrador
  const adminRoutes = [
    '/admin',
    '/api/admin',
    '/api/users', // Rutas que empiezan con /api/users excepto /api/users/me
  ];

  // Verificar si la ruta actual es de admin pero excluir /api/users/me
  const isAdminRoute = adminRoutes.some(route => {
    if (route === '/api/users') {
      return (
        request.nextUrl.pathname.startsWith(route) &&
        request.nextUrl.pathname !== '/api/users/me' &&
        !request.nextUrl.pathname.startsWith('/api/users/me/')
      );
    }
    return request.nextUrl.pathname.startsWith(route);
  });

  // Verificar si la ruta requiere autenticación básica
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // Handle /api/posts separately
  const isPostsRoute = request.nextUrl.pathname.startsWith('/api/posts');
  const isPostsGetRequest = isPostsRoute && request.method === 'GET';

  console.log('¿Ruta requiere autenticación básica?', isAuthRoute);
  console.log('¿Ruta requiere ser admin?', isAdminRoute);
  console.log('¿Ruta es /api/posts?', isPostsRoute);
  console.log('¿Es GET /api/posts?', isPostsGetRequest);

  // Allow GET /api/posts without authentication (handler will enforce published=true for unauthenticated users)
  if (isPostsGetRequest) {
    console.log('Permitiendo GET /api/posts sin autenticación');
    return NextResponse.next();
  }

  // For other routes that don’t require authentication, continue
  if (!isAuthRoute && !isAdminRoute && !isPostsRoute) {
    console.log('Ruta pública, continuando...');
    return NextResponse.next();
  }

  // If no token and the route requires authentication, redirect to login
  if (!token) {
    console.log('No hay token para una ruta protegida');

    if (request.nextUrl.pathname.startsWith('/api/')) {
      console.log('Retornando 401 para API sin token');
      return NextResponse.json(
        { error: 'No autorizado. Se requiere autenticación.' },
        { status: 401 }
      );
    }

    console.log('Redirigiendo a login (sin token)');
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  try {
    console.log('Verificando token JWT');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET no está definido');
      throw new Error('Configuración del servidor incompleta');
    }

    const secretKey = new TextEncoder().encode(jwtSecret);
    const { payload } = (await jwtVerify(token, secretKey)) as JWTVerifyResult & { payload: JwtPayload };

    console.log('Token verificado para el usuario:', payload.userId);
    console.log('Rol del usuario:', payload.role);

    // For admin routes, verify role
    if (isAdminRoute && payload.role !== 'ADMIN') {
      console.log('Acceso denegado: ruta de admin pero usuario no es admin');

      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Acceso denegado. Se requieren privilegios de administrador.' },
          { status: 403 }
        );
      }

      return NextResponse.redirect(new URL('/', request.url));
    }

    // Add user info to request
    const requestWithUser = request as NextRequest & { user?: JwtPayload };
    requestWithUser.user = payload;

    console.log('Autenticación exitosa, continuando...');
    return NextResponse.next();
  } catch (error) {
    console.error('Error al verificar el token JWT:', error);

    if (error instanceof Error) {
      console.log('Nombre del error:', error.name);
      console.log('Mensaje:', error.message);
    }

    if (request.nextUrl.pathname.startsWith('/api/')) {
      console.log('Retornando 401 para API con token inválido');
      return NextResponse.json(
        { error: 'No autorizado. Token inválido o expirado.' },
        { status: 401 }
      );
    }

    console.log('Redirigiendo a login (token inválido)');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    '/api/posts/:path*',
    '/api/users/:path*',
    '/api/admin/:path*',
    '/api/categories/:path*',
    '/api/likes/:path*',
    '/api/comments/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};