import type { Round } from "./types"
import { questions } from "./questions"

export async function getCurrentRound(): Promise<Round> {
  if (process.env.EDGE_CONFIG) {
    try {
      const { get } = await import("@vercel/edge-config")
      const round = await get<Round>("current_round")
      if (round) return round
    } catch {
      // Edge Config read failed, fall through to default
    }
  }
  // Local dev or no Edge Config: serve first question
  return questions[0]
}
