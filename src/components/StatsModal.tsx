interface StatsModalProps {
  gamesPlayed: number
  wins: number
  currentStreak: number
  maxStreak: number
  score: number
  total: number
}

export default function StatsModal({ gamesPlayed, wins, currentStreak, maxStreak, score, total }: StatsModalProps) {
  const winPct = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0

  return (
    <div className="stats">
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{gamesPlayed}</span>
          <span className="stat-label">Played</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{winPct}</span>
          <span className="stat-label">Win %</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{currentStreak}</span>
          <span className="stat-label">Streak</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{maxStreak}</span>
          <span className="stat-label">Max Streak</span>
        </div>
      </div>
      <div className="stats-score">Score: {score}/{total}</div>
    </div>
  )
}
