export interface Answer { text: string; points: number }
export interface Round { id: string; prompt: string; answers: Answer[] }
