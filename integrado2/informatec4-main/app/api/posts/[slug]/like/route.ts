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

// POST /api/posts/[slug]/like - Dar/quitar like a una publicación
export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Extraer el slug manualmente de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    // En una ruta como /api/posts/[slug]/like, el slug estará en la penúltima posición
    let slug = '';
    const likeIndex = pathParts.findIndex(part => part === 'like');
    if (likeIndex > 0) {
      slug = pathParts[likeIndex - 1];
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
        { error: 'Debes iniciar sesión para dar like' },
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
    
    // Obtener la publicación por slug
    const post = await prisma.post.findUnique({
      where: { slug },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar si ya existe un like
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: post.id,
        userId: user.id,
      },
    });
    
    // Si ya existe un like, eliminarlo (toggle)
    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      
      // Contar likes actualizados
      const likeCount = await prisma.like.count({
        where: { postId: post.id },
      });
      
      return NextResponse.json({
        message: 'Like removido exitosamente',
        liked: false,
        likeCount,
      });
    }
    
    // Si no existe un like, crearlo
    await prisma.like.create({
      data: {
        post: { connect: { id: post.id } },
        user: { connect: { id: user.id } },
      },
    });
    
    // Contar likes actualizados
    const likeCount = await prisma.like.count({
      where: { postId: post.id },
    });
    
    return NextResponse.json({
      message: 'Like agregado exitosamente',
      liked: true,
      likeCount,
    });
    
  } catch (error) {
    console.error('Error al procesar like:', error);
    return NextResponse.json(
      { error: 'Error al procesar like' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/posts/[slug]/like - Verificar si el usuario dio like
export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Extraer el slug manualmente de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    // En una ruta como /api/posts/[slug]/like, el slug estará en la penúltima posición
    let slug = '';
    const likeIndex = pathParts.findIndex(part => part === 'like');
    if (likeIndex > 0) {
      slug = pathParts[likeIndex - 1];
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
    
    // Obtener la publicación por slug
    const post = await prisma.post.findUnique({
      where: { slug },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }
    
    // Contar likes
    const likeCount = await prisma.like.count({
      where: { postId: post.id },
    });
    
    // Verificar autenticación
    const token = request.cookies.get('token')?.value;
    
    // Si no hay token, devolver solo el conteo
    if (!token) {
      return NextResponse.json({ liked: false, likeCount });
    }
    
    try {
      // Verificar y decodificar el token
      const jwtSecret = process.env.JWT_SECRET || 'secret_default_key';
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      
      // Obtener el usuario
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      
      if (!user) {
        return NextResponse.json({ liked: false, likeCount });
      }
      
      // Verificar si existe un like
      const existingLike = await prisma.like.findFirst({
        where: {
          postId: post.id,
          userId: user.id,
        },
      });
      
      return NextResponse.json({
        liked: !!existingLike,
        likeCount,
      });
    } catch (error) {
      // Si hay error con el token, devolver solo el conteo
      return NextResponse.json({ liked: false, likeCount });
    }
    
  } catch (error) {
    console.error('Error al verificar like:', error);
    return NextResponse.json(
      { error: 'Error al verificar like' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}