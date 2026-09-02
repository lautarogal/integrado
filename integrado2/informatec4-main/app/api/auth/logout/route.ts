import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Crear una respuesta
    const response = NextResponse.json({
      message: 'Sesión cerrada con éxito',
    });
    
    // Eliminar la cookie del token
    response.cookies.delete('token');
    
    return response;
    
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}