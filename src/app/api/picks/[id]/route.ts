import { NextResponse } from 'next/server';
import { updatePick, deletePick } from '@/lib/db/picksDb';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updated = await updatePick(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Pronóstico no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in PUT /api/picks/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el pronóstico' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const success = await deletePick(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Pronóstico no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Pronóstico eliminado' });
  } catch (error) {
    console.error('Error in DELETE /api/picks/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el pronóstico' },
      { status: 500 }
    );
  }
}
