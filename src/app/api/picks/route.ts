import { NextResponse } from 'next/server';
import { getAllPicks, createPick, createPicks } from '@/lib/db/picksDb';
import type { Pick } from '@/types/pick';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const picks = await getAllPicks();
    return NextResponse.json(
      { success: true, data: picks },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
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

    // Soporte para creación en lote (array de picks)
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ success: true, data: [], count: 0 });
      }
      const validPicks: Pick[] = body.map((item, idx) => ({
        ...item,
        id: item.id || `pick-${Date.now()}-${idx}`,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      const created = await createPicks(validPicks);
      return NextResponse.json({ success: true, data: created, count: created.length }, { status: 201 });
    }

    // Validación básica para pick individual
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
