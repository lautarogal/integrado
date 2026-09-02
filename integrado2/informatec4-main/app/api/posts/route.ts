import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
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

// POST /api/posts - Crear una nueva publicación
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para crear publicaciones.' },
        { status: 401 }
      );
    }
    
    // Verificar y decodificar el token
    const jwtSecret = process.env.JWT_SECRET || 'secret_default_key';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Verificar si el usuario es ADMIN o EDITOR
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear publicaciones.' },
        { status: 403 }
      );
    }
    
    // Obtener datos del cuerpo de la solicitud
    const data = await request.json();
    
    // Validar datos requeridos
    const { title, description, content } = data;
    
    if (!title || !description || !content) {
      return NextResponse.json(
        { error: 'Título, descripción y contenido son obligatorios.' },
        { status: 400 }
      );
    }
    
    // Crear un slug único basado en el título
    let slug = slugify(title, { lower: true, strict: true });
    
    // Verificar si el slug ya existe y modificarlo si es necesario
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });
    
    if (existingPost) {
      // Añadir un identificador único al slug
      slug = `${slug}-${Date.now()}`;
    }
    
    // Procesar la imagen de portada (asegurar que hay una URL)
    const coverImage = data.coverImage || 'https://via.placeholder.com/1200x630?text=Noticia+Escolar';
    
    // Crear la publicación
    const newPost = await prisma.post.create({
      data: {
        title,
        slug,
        description,
        content,
        coverImage,
        published: data.published !== undefined ? data.published : false,
        pageLayout: data.pageLayout || 'default',
        pageTheme: data.pageTheme || 'light',
        author: {
          connect: { id: user.id },
        },
      },
    });
    
    // Asociar categorías si se proporcionaron
    if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
      for (const categoryId of data.categories) {
        try {
          await prisma.categoryOnPost.create({
            data: {
              post: { connect: { id: newPost.id } },
              category: { connect: { id: categoryId } },
            },
          });
        } catch (error) {
          console.error('Error al asociar categoría:', error);
          // Continuar con las siguientes categorías incluso si una falla
        }
      }
    }
    
    // Obtener la publicación completa con sus relaciones
    const postWithRelations = await prisma.post.findUnique({
      where: { id: newPost.id },
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
    
    return NextResponse.json(
      { 
        message: 'Publicación creada exitosamente',
        post: postWithRelations 
      }, 
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error al crear la publicación:', error);
    return NextResponse.json(
      { error: 'Error al crear la publicación' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/posts - Obtener todas las publicaciones con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros de filtrado y paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const publishedParam = searchParams.get('published');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // Calcular offset para paginación
    const skip = (page - 1) * limit;
    
    // Construir condiciones de filtrado
    const where: any = {};
    console.log( publishedParam )
    // Filtrar por estado de publicación
    if (publishedParam === 'true') {
      where.published = true;
    } else if (publishedParam === 'false') {
      // Verificar si el usuario está autenticado para ver borradores
      const token = request.cookies.get('token')?.value;
      
      if (token) {
        try {
          const jwtSecret = process.env.JWT_SECRET || 'secret_default_key';
          const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
          
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
          });
          
          // Solo admins y editores pueden ver borradores
          if (user && (user.role === 'ADMIN' || user.role === 'EDITOR')) {
            where.published = false;
          } else {
            // Usuarios normales solo ven publicados
            where.published = true;
          }
        } catch (error) {
          // Si hay error con el token, mostrar solo publicados
          where.published = true;
        }
      } else {
        // Sin token, mostrar solo publicados
        where.published = true;
      }
    } else {
      // Por defecto, mostrar solo publicados si no hay token o el usuario no es admin/editor
      const token = request.cookies.get('token')?.value;
      
      if (!token) {
        where.published = true;
      } else {
        try {
          const jwtSecret = process.env.JWT_SECRET || 'secret_default_key';
          const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
          
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
          });
          
          // Si no es admin ni editor, mostrar solo publicados
          if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
            where.published = true;
          }
        } catch (error) {
          // Si hay error con el token, mostrar solo publicados
          where.published = true;
        }
      }
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }
    
    // Búsqueda por título o descripción
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    
    // Obtener publicaciones con paginación y filtros
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });
    
    // Obtener el número total de publicaciones para la paginación
    const totalPosts = await prisma.post.count({ where });
    const totalPages = Math.ceil(totalPosts / limit);
    
    return NextResponse.json({
      posts,
      pagination: {
        total: totalPosts,
        pages: totalPages,
        page,
        limit,
      },
    });
    
  } catch (error) {
    console.error('Error al obtener las publicaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener las publicaciones' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}