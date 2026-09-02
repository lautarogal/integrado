import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { nombre, apellido, curso, division, email, password } = await request.json();
    
    // Validar campos requeridos
    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, apellido, email y contraseña son obligatorios' },
        { status: 400 }
      );
    }
    
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      );
    }
    
    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Crear nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        nombre,
        apellido,
        curso: curso || null,
        division: division || null,
        email,
        password: hashedPassword,
        role: 'USER', // Por defecto, todos los usuarios son normales
      },
    });
    
    // Excluir la contraseña de la respuesta
    const userWithoutPassword = {
      id: newUser.id,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      curso: newUser.curso,
      division: newUser.division,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
    
    return NextResponse.json({
      message: 'Usuario registrado con éxito',
      user: userWithoutPassword,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}