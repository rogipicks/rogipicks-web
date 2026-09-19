import { NextResponse } from 'next/server';
import { getAllPicks, createPick } from '@/lib/db/picksDb';
import type { Pick } from '@/types/pick';

export async function GET() {
  try {
    const picks = await getAllPicks();
    return NextResponse.json({ success: true, data: picks });
  } catch (error) {
    console.error('Error in GET /api/picks:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener los pronósticos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validación básica
    if (!body.selection || !body.odds || !body.match) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos para crear el pronóstico' },
        { status: 400 }
      );
    }

    const newPick: Pick = {
      ...body,
      id: body.id || `pick-${Date.now()}`,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await createPick(newPick);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/picks:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar el pronóstico' },
      { status: 500 }
    );
  }
}
