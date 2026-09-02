import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
export async function GET(request: NextRequest) {
    try {
      console.log('API: Obteniendo perfil de usuario');
      
      // Obtener token de las cookies
      const token = request.cookies.get('token')?.value;
      console.log('API: Token presente:', !!token);
      
      if (!token) {
        console.log('API: No hay token en las cookies');
        return NextResponse.json(
          { error: 'No autorizado - Token no encontrado' },
          { status: 401 }
        );
      }
      
      try {
        // Verificar y decodificar el token
        console.log('API: Verificando token JWT');
        const jwtSecret = process.env.JWT_SECRET || 'secret_default_key';
        console.log('API: JWT_SECRET definido:', !!process.env.JWT_SECRET);
        
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        console.log('API: Token verificado correctamente, userId:', decoded.userId);
        
        // Buscar el usuario en la base de datos
        console.log('API: Buscando usuario en la base de datos');
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });
        
        console.log('API: Usuario encontrado:', !!user);
        
        if (!user) {
          console.log('API: Usuario no encontrado en la base de datos');
          return NextResponse.json(
            { error: 'Usuario no encontrado en la base de datos' },
            { status: 404 }
          );
        }
        
        // Excluir la contraseña de la respuesta
        const userWithoutPassword = {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          curso: user.curso,
          division: user.division,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
        
        console.log('API: Retornando datos de usuario sin contraseña');
        return NextResponse.json(userWithoutPassword);
      } catch (jwtError) {
        console.error('API: Error al verificar el token JWT:', jwtError);
        
        if (jwtError instanceof Error) {
          console.log('API: Nombre del error:', jwtError.name);
          console.log('API: Mensaje del error:', jwtError.message);
          
          if (jwtError.name === 'JsonWebTokenError' || jwtError.name === 'TokenExpiredError') {
            return NextResponse.json(
              { error: `Token inválido o expirado: ${jwtError.message}` },
              { status: 401 }
            );
          }
        }
        
        // Relanzar el error para que sea capturado por el catch general
        throw jwtError;
      }
    } catch (error) {
      console.error('API: Error general al obtener perfil del usuario:', error);
      
      let errorMessage = 'Error al obtener perfil del usuario';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
        console.error('API: Stack de error:', error.stack);
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    } finally {
      console.log('API: Desconectando Prisma');
      await prisma.$disconnect();
    }
  }

// Actualizar perfil de usuario
export async function PUT(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar y decodificar el token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'secret_default_key'
    ) as JwtPayload;
    
    // Obtener datos a actualizar
    const data = await request.json();
    const { nombre, apellido, curso, division } = data;
    
    // Preparar datos para actualización
    const updateData: {
      nombre?: string;
      apellido?: string;
      curso?: string | null;
      division?: string | null;
    } = {};
    
    if (nombre !== undefined) updateData.nombre = nombre;
    if (apellido !== undefined) updateData.apellido = apellido;
    if (curso !== undefined) updateData.curso = curso;
    if (division !== undefined) updateData.division = division;
    
    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
    });
    
    // Excluir la contraseña de la respuesta
    const userWithoutPassword = {
      id: updatedUser.id,
      nombre: updatedUser.nombre,
      apellido: updatedUser.apellido,
      curso: updatedUser.curso,
      division: updatedUser.division,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
    
    return NextResponse.json({
      message: 'Perfil actualizado con éxito',
      user: userWithoutPassword,
    });
    
  } catch (error) {
    console.error('Error al actualizar perfil del usuario:', error);
    
    if (error instanceof Error && 
        (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar perfil del usuario' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}