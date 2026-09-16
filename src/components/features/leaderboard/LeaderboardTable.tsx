import React from 'react';
import type { TipsterLeaderboardEntry } from '@/lib/data/mockTipsters';
import styles from './LeaderboardTable.module.css';

interface LeaderboardTableProps {
  tipsters: TipsterLeaderboardEntry[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ tipsters }) => {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className={`${styles.rankBadge} ${styles.gold}`}>🥇 1</span>;
      case 2:
        return <span className={`${styles.rankBadge} ${styles.silver}`}>🥈 2</span>;
      case 3:
        return <span className={`${styles.rankBadge} ${styles.bronze}`}>🥉 3</span>;
      default:
        return <span className={styles.rankNum}>#{rank}</span>;
    }
  };

  const renderStreak = (streak: string) => {
    return (
      <div className={styles.streakContainer}>
        {streak.split('').map((char, i) => (
          <span
            key={i}
            className={`${styles.streakDot} ${
              char === 'W' ? styles.streakWin : styles.streakLoss
            }`}
          >
            {char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Posición</th>
            <th className={styles.th}>Tipster</th>
            <th className={styles.th}>Deporte</th>
            <th className={styles.th}>Picks</th>
            <th className={styles.th}>Win Rate</th>
            <th className={styles.th}>Beneficio</th>
            <th className={styles.th}>Yield / ROI</th>
            <th className={styles.th}>Últimos 5</th>
          </tr>
        </thead>
        <tbody>
          {tipsters.map((tipster) => (
            <tr key={tipster.userId} className={styles.row}>
              <td className={styles.tdRank}>{getRankBadge(tipster.rank)}</td>
              <td className={styles.tdUser}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {tipster.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={styles.username}>@{tipster.username}</span>
                </div>
              </td>
              <td className={styles.tdSport}>
                <span className={styles.sportBadge}>{tipster.bestSport}</span>
              </td>
              <td className={styles.td}>{tipster.totalPicks}</td>
              <td className={styles.td}>
                <span className={styles.winRate}>{tipster.winRate}%</span>
              </td>
              <td className={styles.td}>
                <span className={styles.profit}>+{tipster.profitUnits}u</span>
              </td>
              <td className={styles.td}>
                <span className={styles.roi}>+{tipster.roi}%</span>
              </td>
              <td className={styles.td}>{renderStreak(tipster.streak)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
