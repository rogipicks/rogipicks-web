import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'La generación de camisetas con IA ha sido desactivada en favor del sistema de banderas oficiales.' },
    { status: 410 }
  );
}
