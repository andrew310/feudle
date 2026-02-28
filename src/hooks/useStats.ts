import { useState, useCallback } from "react"

interface GameRecord {
  date: string
  score: number
  total: number
  won: boolean
}

interface Stats {
  gamesPlayed: number
  wins: number
  losses: number
  currentStreak: number
  maxStreak: number
  scoreHistory: GameRecord[]
}

const STORAGE_KEY = "feudle-stats"

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupt data, start fresh
  }
  return { gamesPlayed: 0, wins: 0, losses: 0, currentStreak: 0, maxStreak: 0, scoreHistory: [] }
}

function saveStats(stats: Stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(loadStats)

  const recordGame = useCallback((date: string, score: number, total: number, won: boolean) => {
    setStats((prev) => {
      // Deduplicate by date
      if (prev.scoreHistory.some((r) => r.date === date)) return prev

      const next: Stats = {
        gamesPlayed: prev.gamesPlayed + 1,
        wins: prev.wins + (won ? 1 : 0),
        losses: prev.losses + (won ? 0 : 1),
        currentStreak: won ? prev.currentStreak + 1 : 0,
        maxStreak: won ? Math.max(prev.maxStreak, prev.currentStreak + 1) : prev.maxStreak,
        scoreHistory: [...prev.scoreHistory, { date, score, total, won }],
      }
      saveStats(next)
      return next
    })
  }, [])

  return { stats, recordGame }
}
