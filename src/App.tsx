import { useState, useEffect, useRef } from 'react'
import './App.css'
import { useStats } from './hooks/useStats'
import { loadGameState, saveGameState, cleanOldGameStates } from './hooks/useGameState'
import StatsModal from './components/StatsModal'

interface RoundData {
  id: string
  prompt: string
  answerCount: number
  answers: { points: number }[]
}

interface RevealedAnswer {
  text: string
  points: number
}

function App() {
  const [round, setRound] = useState<RoundData | null>(null)
  const [revealed, setRevealed] = useState<Map<number, RevealedAnswer>>(new Map())
  const [strikes, setStrikes] = useState(0)
  const [currentGuess, setCurrentGuess] = useState("")
  const [gameStatus, setGameStatus] = useState<"loading" | "playing" | "won" | "lost">("loading")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("feudle-theme") as "dark" | "light") || "dark"
  })
  const { stats, recordGame } = useStats()
  const recordedRef = useRef(false)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("feudle-theme", theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => t === "dark" ? "light" : "dark")
  }

  useEffect(() => {
    fetch("/api/round")
      .then((res) => res.json())
      .then((data: RoundData) => {
        setRound(data)
        cleanOldGameStates(data.id)

        const saved = loadGameState(data.id)
        if (saved) {
          setRevealed(new Map(saved.revealed))
          setStrikes(saved.strikes)
          setGameStatus(saved.gameStatus)
          if (saved.gameStatus === "won" || saved.gameStatus === "lost") {
            recordedRef.current = true
          }
        } else {
          setGameStatus("playing")
        }
      })
  }, [])

  // Persist game state on changes
  useEffect(() => {
    if (!round || gameStatus === "loading") return
    saveGameState(round.id, revealed, strikes, gameStatus as "playing" | "won" | "lost")
  }, [round, revealed, strikes, gameStatus])

  // Record stats and show modal when game ends
  useEffect(() => {
    if (!round || (gameStatus !== "won" && gameStatus !== "lost")) return
    setShowStats(true)
    if (recordedRef.current) return
    recordedRef.current = true
    const score = [...revealed.values()].reduce((sum, a) => sum + a.points, 0)
    const total = round.answers.reduce((sum, a) => sum + a.points, 0)
    recordGame(round.id, score, total, gameStatus === "won")
  }, [gameStatus, round, revealed, recordGame])

  async function submitGuess() {
    const guess = currentGuess.trim()
    if (!guess || !round || isSubmitting) return

    setIsSubmitting(true)
    setCurrentGuess("")

    try {
      const res = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guess,
          roundId: round.id,
          revealedIndices: [...revealed.keys()],
        }),
      })
      const data = await res.json()

      if (data.matched) {
        const next = new Map(revealed)
        next.set(data.answerIndex, { text: data.answerText, points: data.points })
        setRevealed(next)
        if (next.size === round.answerCount) setGameStatus("won")
      } else {
        const nextStrikes = strikes + 1
        setStrikes(nextStrikes)
        if (nextStrikes >= 3) setGameStatus("lost")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (gameStatus === "loading" || !round) {
    return (
      <div className="app">
        <nav className="nav">
          <h1>Feudle</h1>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </nav>
        <div className="clue">Loading...</div>
      </div>
    )
  }

  const isOver = gameStatus === "won" || gameStatus === "lost"

  function shareResult() {
    if (!round) return
    const squares = round.answers.map((_, i) => revealed.has(i) ? "\u{1F7E6}" : "\u2B1B")
    const rows = Array.from({ length: 4 }, (_, r) => squares[r] + squares[r + 4])
    const board = rows.join("\n")
    const score = [...revealed.values()].reduce((sum, a) => sum + a.points, 0)
    const total = round.answers.reduce((sum, a) => sum + a.points, 0)
    const text = `Feudle ${score}/${total}\n${board}\n\nPlay now: https://feudle-psi.vercel.app`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const score = [...revealed.values()].reduce((sum, a) => sum + a.points, 0)
  const total = round.answers.reduce((sum, a) => sum + a.points, 0)

  return (
    <div className="app">
      <nav className="nav">
        <h1>Feudle</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </nav>
      <div className="clue">{round.prompt}</div>
      <main className="board">
        {round.answers.map((answer, i) => {
          const rev = revealed.get(i)
          return (
            <div key={i} className={`cell ${rev ? "revealed" : ""}`}>
              {rev ? (
                <>
                  <span className="cell-text">{rev.text}</span>
                  <span className="cell-points">{rev.points}</span>
                </>
              ) : (
                <>
                  <span className="cell-text"></span>
                  <span className="cell-points">{answer.points}</span>
                </>
              )}
            </div>
          )
        })}
      </main>
      <div className="strikes">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className={`strike ${i < strikes ? "hit" : ""}`}>
            X
          </span>
        ))}
      </div>
      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        gamesPlayed={stats.gamesPlayed}
        wins={stats.wins}
        currentStreak={stats.currentStreak}
        maxStreak={stats.maxStreak}
        score={score}
        total={total}
        onShare={shareResult}
        copied={copied}
      />
      {isOver ? (
        !showStats && (
          <div className="game-message">
            {gameStatus === "won" ? "You got them all!" : "Game over!"}
            <button className="share-btn" onClick={() => setShowStats(true)}>
              Stats
            </button>
          </div>
        )
      ) : (
        <form
          className="guess-form"
          onSubmit={(e) => {
            e.preventDefault()
            submitGuess()
          }}
        >
          <input
            className="guess-input"
            type="text"
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value)}
            placeholder="Type your answer..."
            autoFocus
            disabled={isSubmitting}
          />
          <button className="guess-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  )
}

export default App
