/** 考试类型 */
export type ExamType = 'toefl' | 'gre' | 'sat' | 'ssat'

/** 单词掌握状态 */
export type MasteryStatus = 'new' | 'learning' | 'review' | 'mastered'

/** 单个单词完整信息 */
export interface Word {
  id: string
  word: string
  phonetic: string
  phoneticAm?: string
  partOfSpeech: string
  definitionEn: string
  definitionCn: string
  synonyms: string[]
  antonyms: string[]
  exampleSentence: string
  exampleTranslation: string
  rootAffix?: string
  examTags: ExamType[]
  frequency: number // 词频，越高越常用
}

/** 学习记录 */
export interface LearningRecord {
  wordId: string
  status: MasteryStatus
  reviewCount: number
  correctCount: number
  wrongCount: number
  lastReviewAt: number // timestamp
  nextReviewAt: number // timestamp
  easeFactor: number // SM-2 算法的 ease factor
  interval: number // 当前间隔（天）
}

/** 测验题目 */
export interface QuizQuestion {
  wordId: string
  type: 'choice' | 'fill' | 'match'
  question: string
  options?: string[]
  correctAnswer: string
}

/** 每日统计 */
export interface DailyStats {
  date: string
  newLearned: number
  reviewed: number
  correct: number
  wrong: number
}
