'use client';

import React, { useState } from 'react';
import { MOCK_PICKS } from '@/lib/data/mockPicks';
import { PickList } from '@/components/features/picks/PickList';
import { Modal } from '@/components/ui/Modal/Modal';
import { PickForm, type NewPickFormData } from '@/components/features/picks/PickForm';
import type { Pick } from '@/types/pick';
import styles from './picks.module.css';

export default function PicksPage() {
  const [picks, setPicks] = useState<Pick[]>(MOCK_PICKS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreatePick = (data: NewPickFormData) => {
    const newPick: Pick = {
      id: `pick-${Date.now()}`,
      matchId: `m-${Date.now()}`,
      userId: 'u-1',
      user: {
        id: 'u-1',
        username: 'TuUsuario',
        email: 'user@rogipicks.com',
        role: 'tipster',
        createdAt: new Date().toISOString(),
      },
      match: {
        id: `m-${Date.now()}`,
        sport: {
          id: `s-${data.sportCategory}`,
          name: data.sportCategory.toUpperCase(),
          category: data.sportCategory as any,
        },
        homeTeam: {
          id: 't-h',
          name: data.matchTeams.split('vs')[0]?.trim() || data.matchTeams,
          shortName: 'LOC',
          sportId: `s-${data.sportCategory}`,
        },
        awayTeam: {
          id: 't-a',
          name: data.matchTeams.split('vs')[1]?.trim() || 'Rival',
          shortName: 'VIS',
          sportId: `s-${data.sportCategory}`,
        },
        startTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'scheduled',
        odds: {
          homeWin: data.odds,
          awayWin: 2.1,
          updatedAt: new Date().toISOString(),
        },
      },
      selection: data.selection,
      odds: data.odds,
      stake: data.stake,
      potentialReturn: Number((data.stake * data.odds).toFixed(2)),
      confidence: data.confidence,
      result: 'pending',
      analysis: data.analysis,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPicks([newPick, ...picks]);
    setIsModalOpen(false);
  };

  return (
    <div className="container" style={{ paddingBlock: 'var(--space-8)' }}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pronósticos Deportivos</h1>
          <p className={styles.subtitle}>
            Descubre y analiza las mejores cuotas y pronósticos de la comunidad.
          </p>
        </div>
      </div>

      <PickList
        initialPicks={picks}
        onOpenCreateModal={() => setIsModalOpen(true)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publicar Nuevo Pronóstico 🎯"
      >
        <PickForm
          onSubmit={handleCreatePick}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
