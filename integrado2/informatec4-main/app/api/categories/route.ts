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

// GET: Obtener todas las categorías
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Crear una nueva categoría
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para crear categorías' },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET || 'secret_default_key';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear categorías' },
        { status: 403 }
      );
    }

    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre de la categoría es obligatorio' },
        { status: 400 }
      );
    }

    const slug = slugify(name, { lower: true, strict: true });

    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre o slug' },
        { status: 400 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json(
      {
        message: 'Categoría creada exitosamente',
        category: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
