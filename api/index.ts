import { Hono } from "hono"
import { handle } from "hono/vercel"
import OpenAI from "openai"
import { createClient } from "redis"

// --- Types ---

interface Answer { text: string; points: number }
interface Round { id: string; prompt: string; answers: Answer[] }

// --- Question Bank ---

const questions: Round[] = [
  {
    id: "beta-1",
    prompt: "Name something you'd bring to the beach",
    answers: [
      { text: "Towel", points: 32 },
      { text: "Sunscreen", points: 25 },
      { text: "Umbrella", points: 15 },
      { text: "Cooler", points: 10 },
      { text: "Chair", points: 8 },
      { text: "Ball", points: 5 },
      { text: "Book", points: 3 },
      { text: "Radio", points: 2 },
    ],
  },
  {
    id: "beta-2",
    prompt: "Name something people forget to pack on vacation",
    answers: [
      { text: "Toothbrush", points: 30 },
      { text: "Charger", points: 25 },
      { text: "Underwear", points: 15 },
      { text: "Sunscreen", points: 10 },
      { text: "Medication", points: 8 },
      { text: "Socks", points: 5 },
      { text: "Pajamas", points: 4 },
      { text: "Deodorant", points: 3 },
    ],
  },
  {
    id: "beta-3",
    prompt: "Name a reason someone might be late to work",
    answers: [
      { text: "Traffic", points: 35 },
      { text: "Overslept", points: 28 },
      { text: "Car trouble", points: 12 },
      { text: "Kids", points: 9 },
      { text: "Weather", points: 6 },
      { text: "Alarm didn't go off", points: 4 },
      { text: "Got lost", points: 3 },
      { text: "Forgot something", points: 3 },
    ],
  },
  {
    id: "beta-4",
    prompt: "Name something you'd find in a doctor's office",
    answers: [
      { text: "Stethoscope", points: 30 },
      { text: "Magazines", points: 22 },
      { text: "Scale", points: 14 },
      { text: "Exam table", points: 12 },
      { text: "Blood pressure cuff", points: 8 },
      { text: "Tongue depressor", points: 6 },
      { text: "Poster", points: 5 },
      { text: "Cotton balls", points: 3 },
    ],
  },
  {
    id: "beta-5",
    prompt: "Name something people do on a first date",
    answers: [
      { text: "Dinner", points: 35 },
      { text: "Movie", points: 22 },
      { text: "Drinks", points: 15 },
      { text: "Walk", points: 10 },
      { text: "Coffee", points: 7 },
      { text: "Bowling", points: 5 },
      { text: "Mini golf", points: 3 },
      { text: "Concert", points: 3 },
    ],
  },
  {
    id: "beta-6",
    prompt: "Name a popular pizza topping",
    answers: [
      { text: "Pepperoni", points: 38 },
      { text: "Mushrooms", points: 18 },
      { text: "Sausage", points: 14 },
      { text: "Onions", points: 10 },
      { text: "Peppers", points: 7 },
      { text: "Olives", points: 5 },
      { text: "Bacon", points: 5 },
      { text: "Pineapple", points: 3 },
    ],
  },
  {
    id: "beta-7",
    prompt: "Name something you'd find in a kitchen junk drawer",
    answers: [
      { text: "Batteries", points: 28 },
      { text: "Tape", points: 20 },
      { text: "Scissors", points: 15 },
      { text: "Pens", points: 12 },
      { text: "Rubber bands", points: 9 },
      { text: "Menus", points: 7 },
      { text: "Matches", points: 5 },
      { text: "Keys", points: 4 },
    ],
  },
  {
    id: "beta-8",
    prompt: "Name an animal you might see at the zoo",
    answers: [
      { text: "Lion", points: 30 },
      { text: "Elephant", points: 25 },
      { text: "Monkey", points: 15 },
      { text: "Giraffe", points: 10 },
      { text: "Bear", points: 8 },
      { text: "Tiger", points: 5 },
      { text: "Penguin", points: 4 },
      { text: "Zebra", points: 3 },
    ],
  },
  {
    id: "beta-9",
    prompt: "Name something that makes you sneeze",
    answers: [
      { text: "Dust", points: 30 },
      { text: "Pollen", points: 25 },
      { text: "Pepper", points: 15 },
      { text: "Cat", points: 10 },
      { text: "Perfume", points: 8 },
      { text: "Cold", points: 5 },
      { text: "Bright light", points: 4 },
      { text: "Feathers", points: 3 },
    ],
  },
  {
    id: "beta-10",
    prompt: "Name something you'd grab during a fire drill",
    answers: [
      { text: "Phone", points: 35 },
      { text: "Wallet", points: 22 },
      { text: "Keys", points: 15 },
      { text: "Pet", points: 10 },
      { text: "Kids", points: 8 },
      { text: "Jacket", points: 4 },
      { text: "Laptop", points: 3 },
      { text: "Shoes", points: 3 },
    ],
  },
  {
    id: "beta-11",
    prompt: "Name something people collect",
    answers: [
      { text: "Stamps", points: 28 },
      { text: "Coins", points: 25 },
      { text: "Cards", points: 15 },
      { text: "Figurines", points: 10 },
      { text: "Vinyl records", points: 8 },
      { text: "Books", points: 6 },
      { text: "Shells", points: 5 },
      { text: "Magnets", points: 3 },
    ],
  },
  {
    id: "beta-12",
    prompt: "Name something that runs on batteries",
    answers: [
      { text: "Remote control", points: 32 },
      { text: "Flashlight", points: 22 },
      { text: "Toy", points: 15 },
      { text: "Clock", points: 10 },
      { text: "Smoke detector", points: 8 },
      { text: "Game controller", points: 5 },
      { text: "Mouse", points: 5 },
      { text: "Keyboard", points: 3 },
    ],
  },
]

function getRound(id: string): Round | undefined {
  return questions.find((q) => q.id === id)
}

// --- Redis ---

async function getRedis() {
  const client = createClient({ url: process.env.REDIS_URL })
  await client.connect()
  return client
}

async function getCurrentRound(): Promise<Round> {
  try {
    const redis = await getRedis()
    const id = await redis.get("current_round")
    await redis.quit()
    if (id) {
      const round = getRound(id)
      if (round) return round
    }
  } catch {
    // Redis unavailable, fall through to default
  }
  return questions[0]
}

// --- App ---

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

// GET /api/set — pick next unused question and set it as current
// GET /api/set?q=beta-5 — force a specific question
// GET /api/set?status — show current round and used list
app.get("/set", async (c) => {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = c.req.header("Authorization")
    if (auth !== `Bearer ${cronSecret}`) {
      return c.json({ error: "Unauthorized" }, 401)
    }
  }

  const redis = await getRedis()

  // Status check
  if (c.req.query("status") !== undefined) {
    const currentId = await redis.get("current_round")
    const used = await redis.sMembers("used_rounds")
    await redis.quit()
    const available = questions.filter((q) => !used.includes(q.id))
    return c.json({
      current: currentId,
      used,
      available: available.map((q) => ({ id: q.id, prompt: q.prompt })),
    })
  }

  const forcedId = c.req.query("q")
  let round: Round | undefined

  if (forcedId) {
    round = getRound(forcedId)
    if (!round) {
      await redis.quit()
      return c.json({ error: `Unknown question: ${forcedId}`, available: questions.map((q) => q.id) }, 404)
    }
  } else {
    // Pick next unused question
    const used = await redis.sMembers("used_rounds")
    const available = questions.filter((q) => !used.includes(q.id))
    if (available.length === 0) {
      await redis.quit()
      return c.json({ error: "All questions used! Add more to the bank.", used })
    }
    round = available[0]
  }

  await redis.set("current_round", round.id)
  await redis.sAdd("used_rounds", round.id)
  await redis.quit()

  return c.json({ ok: true, round: { id: round.id, prompt: round.prompt } })
})

export const GET = handle(app)
export const POST = handle(app)
export default app
