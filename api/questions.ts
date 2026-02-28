import type { Round } from "./types"

const questions: Omit<Round, "id">[] = [
  {
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

const EPOCH = new Date("2026-01-01T00:00:00Z").getTime()
const DAY_MS = 86_400_000

export function getRoundForDate(dateStr: string): Round {
  const day = Math.floor((new Date(dateStr + "T00:00:00Z").getTime() - EPOCH) / DAY_MS)
  const index = ((day % questions.length) + questions.length) % questions.length
  return { id: dateStr, ...questions[index] }
}

export { questions }
