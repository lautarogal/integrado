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

// DELETE /api/posts/[slug]/comments/[commentId] - Eliminar un comentario específico
export async function DELETE(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Extraer slug y commentId de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    
    // La estructura de la ruta es /api/posts/[slug]/comments/[commentId]
    // Asumimos que los segmentos están en estas posiciones
    const slug = pathParts[pathParts.length - 3]; // Dos posiciones antes del final (comments/[commentId])
    const commentId = pathParts[pathParts.length - 1]; // Último segmento
    
    if (!slug || !commentId) {
      return NextResponse.json(
        { error: 'Parámetros de ruta incompletos' },
        { status: 400 }
      );
    }
    
    // Verificar autenticación
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para eliminar comentarios' },
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
    
    // Buscar el comentario
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comentario no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar que el comentario pertenece a la publicación correcta
    if (comment.postId !== post.id) {
      return NextResponse.json(
        { error: 'Comentario no pertenece a esta publicación' },
        { status: 400 }
      );
    }
    
    // Verificar permisos (solo el autor del comentario, el autor del post o un admin pueden eliminar)
    if (
      comment.userId !== user.id && 
      post.authorId !== user.id &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este comentario' },
        { status: 403 }
      );
    }
    
    // Eliminar el comentario
    await prisma.comment.delete({
      where: { id: commentId },
    });
    
    return NextResponse.json({
      message: 'Comentario eliminado exitosamente',
    });
    
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar comentario' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}