import type { Round } from "./types"
import { getRoundForDate } from "./questions"

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function getCurrentRound(): Promise<Round> {
  if (process.env.EDGE_CONFIG) {
    try {
      const { get } = await import("@vercel/edge-config")
      const round = await get<Round>("current_round")
      if (round) return round
    } catch {
      // Edge Config read failed, fall through to question bank
    }
  }
  return getRoundForDate(today())
}
