import { NextResponse } from 'next/server';
import { MOCK_PICKS } from '@/lib/data/mockPicks';
import type { ApiResponse } from '@/types/api';
import type { Pick } from '@/types/pick';

// GET /api/picks
export async function GET() {
  const response: ApiResponse<Pick[]> = {
    data: MOCK_PICKS,
    success: true,
    message: 'Picks recuperados correctamente',
  };
  return NextResponse.json(response);
}

// POST /api/picks
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate minimal fields
    if (!body.selection || !body.odds) {
      return NextResponse.json(
        { data: null, success: false, message: 'Faltan campos requeridos: selection u odds' },
        { status: 400 }
      );
    }

    const newPick: Pick = {
      id: `pick-${Date.now()}`,
      matchId: body.matchId || 'custom-match',
      userId: 'u-current',
      selection: body.selection,
      odds: Number(body.odds),
      stake: Number(body.stake) || 1,
      potentialReturn: Number(body.odds) * (Number(body.stake) || 1),
      confidence: body.confidence || 3,
      result: 'pending',
      analysis: body.analysis || '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      data: newPick,
      success: true,
      message: 'Pick creado correctamente',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { data: null, success: false, message: 'Error al procesar el pick' },
      { status: 500 }
    );
  }
}
