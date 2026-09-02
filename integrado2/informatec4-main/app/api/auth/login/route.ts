import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { email, password } = await request.json();
    
    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }
    
    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // Verificar si el usuario existe
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret_default_key',
      { expiresIn: '7d' } // El token expira en 7 días
    );
    
    // Excluir la contraseña de la respuesta
    const userWithoutPassword = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      curso: user.curso,
      division: user.division,
      email: user.email,
      role: user.role,
    };
    
    // Crear una respuesta con la cookie del token
    const response = NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: userWithoutPassword,
      token,
    });
    
    // Añadir la cookie al response
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}