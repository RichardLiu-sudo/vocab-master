import Dexie, { type Table } from 'dexie'
import type { LearningRecord, DailyStats } from '../types/word'

class VocabDB extends Dexie {
  records!: Table<LearningRecord, string>
  dailyStats!: Table<DailyStats, string>

  constructor() {
    super('VocabMaster')
    this.version(1).stores({
      records: 'wordId',
      dailyStats: 'date',
    })
  }
}

export const db = new VocabDB()
