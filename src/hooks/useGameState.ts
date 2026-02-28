interface SavedGameState {
  revealed: [number, { text: string; points: number }][]
  strikes: number
  gameStatus: "playing" | "won" | "lost"
}

function storageKey(roundId: string) {
  return `feudle-game-${roundId}`
}

export function loadGameState(roundId: string): SavedGameState | null {
  try {
    const raw = localStorage.getItem(storageKey(roundId))
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupt data
  }
  return null
}

export function saveGameState(
  roundId: string,
  revealed: Map<number, { text: string; points: number }>,
  strikes: number,
  gameStatus: "playing" | "won" | "lost",
) {
  const data: SavedGameState = {
    revealed: [...revealed.entries()],
    strikes,
    gameStatus,
  }
  localStorage.setItem(storageKey(roundId), JSON.stringify(data))
}

export function cleanOldGameStates(currentRoundId: string) {
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith("feudle-game-") && key !== storageKey(currentRoundId)) {
      toRemove.push(key)
    }
  }
  toRemove.forEach((key) => localStorage.removeItem(key))
}
