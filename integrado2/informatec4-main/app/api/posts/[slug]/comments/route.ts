import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Interfaz para el token JWT decodificado
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// GET /api/posts/[slug]/comments - Obtener comentarios de una publicación
export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Extraer el slug manualmente de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    // En una ruta como /api/posts/[slug]/comments, el slug estará en la penúltima posición
    // si estamos en /comments, o en la antepenúltima si hay más segmentos después
    let slug = '';
    const commentsIndex = pathParts.findIndex(part => part === 'comments');
    if (commentsIndex > 0) {
      slug = pathParts[commentsIndex - 1];
    } else {
      // Fallback: intentar obtener el slug como tercer segmento (asumiendo /api/posts/[slug])
      slug = pathParts[3] || '';
    }
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug no proporcionado' },
        { status: 400 }
      );
    }
    
    const { searchParams } = url;
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Calcular offset para paginación
    const skip = (page - 1) * limit;
    
    // Buscar la publicación por slug
    const post = await prisma.post.findUnique({
      where: { slug },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }
    
    // Obtener comentarios con paginación
    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });
    
    // Obtener el número total de comentarios para la paginación
    const totalComments = await prisma.comment.count({
      where: { postId: post.id },
    });
    
    const totalPages = Math.ceil(totalComments / limit);
    
    return NextResponse.json({
      comments,
      pagination: {
        total: totalComments,
        pages: totalPages,
        page,
        limit,
      },
    });
    
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener comentarios' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/posts/[slug]/comments - Crear un comentario
export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Extraer el slug manualmente de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    // En una ruta como /api/posts/[slug]/comments, el slug estará en la penúltima posición
    let slug = '';
    const commentsIndex = pathParts.findIndex(part => part === 'comments');
    if (commentsIndex > 0) {
      slug = pathParts[commentsIndex - 1];
    } else {
      // Fallback: intentar obtener el slug como tercer segmento (asumiendo /api/posts/[slug])
      slug = pathParts[3] || '';
    }
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug no proporcionado' },
        { status: 400 }
      );
    }
    
    // Verificar autenticación
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para comentar' },
        { status: 401 }
      );
    }
    
    // Verificar y decodificar el token
    const jwtSecret = process.env.JWT_SECRET || 'secret_default_key';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Obtener el usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Buscar la publicación por slug
    const post = await prisma.post.findUnique({
      where: { slug },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }
    
    // Obtener datos del comentario
    const { content } = await request.json();
    
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'El contenido del comentario no puede estar vacío' },
        { status: 400 }
      );
    }
    
    // Crear el comentario
    const newComment = await prisma.comment.create({
      data: {
        content,
        post: { connect: { id: post.id } },
        user: { connect: { id: user.id } },
      },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      message: 'Comentario creado exitosamente',
      comment: newComment,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error al crear comentario:', error);
    return NextResponse.json(
      { error: 'Error al crear comentario' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}