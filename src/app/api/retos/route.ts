import { NextResponse } from 'next/server';
import { getAllRetos, createReto } from '@/lib/db/retosDb';
import type { Reto, RetoStep } from '@/types/reto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const retos = await getAllRetos();
    return NextResponse.json(
      { success: true, data: retos },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/retos:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching retos' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const steps: RetoStep[] = Array.isArray(body.steps)
      ? body.steps.map((step: Partial<RetoStep>, index: number) => ({
          id: step.id || `reto-step-${index + 1}-${Math.random().toString(36).substring(2, 7)}`,
          homeTeam: step.homeTeam || '',
          homeLogo: step.homeLogo || undefined,
          awayTeam: step.awayTeam || '',
          awayLogo: step.awayLogo || undefined,
          desc: step.desc || '',
          result:
            step.result === 'win' || step.result === 'loss' ? step.result : 'pending',
          startAmount: step.startAmount || '',
          endAmount: step.endAmount || '',
          startTime: step.startTime || '',
          bet: step.bet || '',
          odds: step.odds || '',
        }))
      : [];

    const newReto: Reto = {
      id: body.id || `reto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: body.title || 'Nuevo Reto',
      badge: body.badge || 'En Progreso',
      badgeType: body.badgeType || 'active',
      desc: body.desc || '',
      currentStep: body.currentStep || 'Paso 1',
      progress: typeof body.progress === 'number' ? body.progress : parseInt(body.progress || '0', 10),
      stake: body.stake || '10€',
      currentBank: body.currentBank || '0€',
            category: body.category || 'Multideporte',
      telegramUrl: body.telegramUrl || '',
      telegramMode: body.telegramMode === true,
      totalSteps:
        typeof body.totalSteps === 'number' ? body.totalSteps : steps.length || undefined,
      startingAmount: body.startingAmount || '',
      objective: body.objective || '',
      coverImage: body.coverImage || '',
      steps,
      createdAt: new Date().toISOString(),
    };

    const created = await createReto(newReto);
    return NextResponse.json(
      { success: true, data: created },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error in POST /api/retos:', error);
    return NextResponse.json(
      { success: false, error: 'Error creating reto' },
      { status: 500 }
    );
  }
}
