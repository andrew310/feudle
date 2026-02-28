import { useEffect, useRef } from "react"

interface StatsModalProps {
  open: boolean
  onClose: () => void
  gamesPlayed: number
  wins: number
  currentStreak: number
  maxStreak: number
  score: number
  total: number
  onShare: () => void
  copied: boolean
}

export default function StatsModal({
  open, onClose, gamesPlayed, wins, currentStreak, maxStreak, score, total, onShare, copied,
}: StatsModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const winPct = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="stats-dialog" onClose={onClose}>
      <h2 className="stats-title">
        {score === total ? "You got them all!" : "Game over!"}
      </h2>
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
      <button className="share-btn" onClick={onShare}>
        {copied ? "Copied!" : "Share"}
      </button>
    </dialog>
  )
}
