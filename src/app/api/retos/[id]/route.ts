import { NextResponse } from 'next/server';
import { updateReto, deleteReto } from '@/lib/db/retosDb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateReto(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Reto not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error updating reto:', error);
    return NextResponse.json(
      { success: false, error: 'Error updating reto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteReto(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Reto not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Reto deleted successfully' },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error deleting reto:', error);
    return NextResponse.json(
      { success: false, error: 'Error deleting reto' },
      { status: 500 }
    );
  }
}
