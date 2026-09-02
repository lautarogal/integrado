import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import slugify from 'slugify';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const url = new URL(request.url);
  const slug = url.pathname.split('/').pop(); 

  if (!slug) {
    return NextResponse.json({ error: 'Slug no proporcionado' }, { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }

    if (!post.published) {
      const token = request.cookies.get('token')?.value;

      if (!token) {
        return NextResponse.json({ error: 'Publicación no disponible' }, { status: 403 });
      }

      try {
        const jwtSecret = process.env.JWT_SECRET || 'secret_default_key';
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });

        if (!user || (user.id !== post.authorId && user.role !== 'ADMIN')) {
          return NextResponse.json({ error: 'No tienes permisos para ver esta publicación' }, { status: 403 });
        }
      } catch (error) {
        return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
      }
    }

    let userLiked = false;

    const token = request.cookies.get('token')?.value;
    if (token) {
      try {
        const jwtSecret = process.env.JWT_SECRET || 'secret_default_key';
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        const like = await prisma.like.findFirst({
          where: {
            postId: post.id,
            userId: decoded.userId,
          },
        });

        userLiked = !!like;
      } catch (error) {

      }
    }

    return NextResponse.json({
      ...post,
      userLiked,
    });
  } catch (error) {
    console.error('Error al obtener la publicación:', error);
    return NextResponse.json({ error: 'Error al obtener la publicación' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


// PUT /api/posts/[slug] - Actualizar una publicación
export async function PUT(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Extraer el slug manualmente de la URL
    const url = new URL(request.url);
    const slug = url.pathname.split('/').pop(); // extrae el slug manualmente
    
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
        { error: 'Debes iniciar sesión para editar publicaciones' },
        { status: 401 }
      );
    }
    
    // Verificar y decodificar el token
    const jwtSecret = process.env.JWT_SECRET || 'secret_default_key';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Buscar la publicación existente
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      include: {
        categories: true,
      },
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar permisos (solo autor o admin)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user || (user.id !== existingPost.authorId && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar esta publicación' },
        { status: 403 }
      );
    }
    
    // Obtener datos actualizados
    const data = await request.json();
    const {
      title,
      description,
      content,
      coverImage,
      published,
      pageLayout,
      pageTheme,
      categories,
    } = data;
    
    // Preparar datos para actualización
    const updateData: any = {};
    
    // Solo actualizar campos que se proporcionaron
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (published !== undefined) updateData.published = published;
    if (pageLayout !== undefined) updateData.pageLayout = pageLayout;
    if (pageTheme !== undefined) updateData.pageTheme = pageTheme;
    
    // Si el título cambia, actualizar también el slug
    if (title && title !== existingPost.title) {
      let newSlug = slugify(title, { lower: true, strict: true });
      
      // Verificar si el nuevo slug ya existe
      const slugExists = await prisma.post.findFirst({
        where: {
          slug: newSlug,
          id: { not: existingPost.id },
        },
      });
      
      if (slugExists) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      
      updateData.slug = newSlug;
    }
    
    // Actualizar la publicación
    const updatedPost = await prisma.post.update({
      where: { id: existingPost.id },
      data: updateData,
    });
    
    // Actualizar categorías si se proporcionaron
    if (categories && Array.isArray(categories) && categories.length > 0) {
      // Eliminar todas las asociaciones actuales
      await prisma.categoryOnPost.deleteMany({
        where: { postId: existingPost.id },
      });
      
      // Crear nuevas asociaciones
      for (const categoryId of categories) {
        await prisma.categoryOnPost.create({
          data: {
            post: { connect: { id: existingPost.id } },
            category: { connect: { id: categoryId } },
          },
        });
      }
    }
    
    // Obtener la publicación actualizada con sus relaciones
    const postWithRelations = await prisma.post.findUnique({
      where: { id: existingPost.id },
      include: {
        author: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      message: 'Publicación actualizada exitosamente',
      post: postWithRelations,
    });
    
  } catch (error) {
    console.error('Error al actualizar la publicación:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la publicación' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/posts/[slug] - Eliminar una publicación
export async function DELETE(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Extraer el slug manualmente de la URL
    const url = new URL(request.url);
    const slug = url.pathname.split('/').pop(); // extrae el slug manualmente
    
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
        { error: 'Debes iniciar sesión para eliminar publicaciones' },
        { status: 401 }
      );
    }
    
    // Verificar y decodificar el token
    const jwtSecret = process.env.JWT_SECRET || 'secret_default_key';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Buscar la publicación
    const post = await prisma.post.findUnique({
      where: { slug },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar permisos (solo autor o admin)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user || (user.id !== post.authorId && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar esta publicación' },
        { status: 403 }
      );
    }
    
    // Eliminar la publicación (las relaciones se eliminarán automáticamente gracias a onDelete: Cascade)
    await prisma.post.delete({
      where: { id: post.id },
    });
    
    return NextResponse.json({
      message: 'Publicación eliminada exitosamente',
    });
    
  } catch (error) {
    console.error('Error al eliminar la publicación:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la publicación' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
