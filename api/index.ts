import { Hono } from "hono"
import OpenAI from "openai"
import { getCurrentRound } from "./edge-config"
import { getRound, questions } from "./questions"

const app = new Hono().basePath("/api")

const openai = new OpenAI()

app.get("/round", async (c) => {
  const round = await getCurrentRound()
  return c.json({
    id: round.id,
    prompt: round.prompt,
    answerCount: round.answers.length,
    answers: round.answers.map((a) => ({ points: a.points })),
  })
})

app.post("/guess", async (c) => {
  const { guess, roundId, revealedIndices } = await c.req.json<{
    guess: string
    roundId: string
    revealedIndices: number[]
  }>()

  const round = await getCurrentRound()

  if (roundId !== round.id) {
    return c.json({ matched: false }, 400)
  }

  const unrevealed = round.answers
    .map((a, i) => ({ ...a, index: i }))
    .filter((_, i) => !revealedIndices.includes(i))

  if (unrevealed.length === 0) {
    return c.json({ matched: false })
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 64,
    messages: [
      {
        role: "system",
        content: `You are a Family Feud judge. The survey question is: "${round.prompt}"

The remaining answers on the board are:
${unrevealed.map((a) => `${a.index}: ${a.text}`).join("\n")}

A contestant guesses a word/phrase. Determine if their guess matches any answer on the board. Be generous with synonyms, plurals, abbreviations, and paraphrases (e.g. "sunblock" matches "Sunscreen", "beach ball" matches "Ball", "shade" matches "Umbrella").

Respond ONLY with JSON: {"matchedIndex": <number|null>}`,
      },
      { role: "user", content: guess },
    ],
  })

  const text = completion.choices[0]?.message?.content ?? ""
  let matchedIndex: number | null = null
  try {
    const parsed = JSON.parse(text)
    matchedIndex = parsed.matchedIndex
  } catch {
    // LLM returned non-JSON, treat as no match
  }

  if (matchedIndex !== null && matchedIndex >= 0 && matchedIndex < round.answers.length) {
    const answer = round.answers[matchedIndex]
    return c.json({
      matched: true,
      answerIndex: matchedIndex,
      answerText: answer.text,
      points: answer.points,
    })
  }

  return c.json({ matched: false })
})

// Set active question: GET /api/set?q=beta-3
// Lists available questions: GET /api/set
app.get("/set", async (c) => {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = c.req.header("Authorization")
    if (auth !== `Bearer ${cronSecret}`) {
      return c.json({ error: "Unauthorized" }, 401)
    }
  }

  const id = c.req.query("q")
  if (!id) {
    return c.json({ questions: questions.map((q) => ({ id: q.id, prompt: q.prompt })) })
  }

  const round = getRound(id)
  if (!round) {
    return c.json({ error: `Unknown question: ${id}`, available: questions.map((q) => q.id) }, 404)
  }

  const edgeConfigId = process.env.EDGE_CONFIG_ID
  const vercelToken = process.env.VERCEL_API_TOKEN

  if (edgeConfigId && vercelToken) {
    const res = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ operation: "upsert", key: "current_round", value: round }],
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      return c.json({ error: "Edge Config write failed", detail: body }, 500)
    }
  }

  return c.json({ ok: true, round: { id: round.id, prompt: round.prompt } })
})

import { handle } from "hono/vercel"
export const GET = handle(app)
export const POST = handle(app)
export default app
