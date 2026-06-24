import type { LearningRecord, MasteryStatus } from '../types/word'
import { db } from './db'

/** SM-2 算法参数 */
const SM2_CONFIG = {
  minEaseFactor: 1.3,
  initialEase: 2.5,
  easyBonus: 1.3,
  hardPenalty: 1.2,
  againPenalty: 1.5,
}

/** 评分: 0=完全忘了, 1=困难(想起来但费劲), 2=一般, 3=简单, 4=太简单 */
export type ReviewGrade = 0 | 1 | 2 | 3 | 4

/** 计算下次复习时间（天） */
function calcNextInterval(record: LearningRecord, grade: ReviewGrade): number {
  if (grade <= 1) return 1
  if (record.interval === 0) return 1
  if (record.interval === 1) return 3
  return Math.round(record.interval * record.easeFactor)
}

/** 更新 ease factor */
function calcEaseFactor(currentEase: number, grade: ReviewGrade): number {
  const delta = 0.8 - 0.28 * grade + 0.02 * grade * grade
  return Math.max(SM2_CONFIG.minEaseFactor, currentEase + delta)
}

/** 获取状态标签 */
function getStatus(grade: ReviewGrade, interval: number): MasteryStatus {
  if (grade === 0) return 'learning'
  if (interval >= 30) return 'mastered'
  if (interval >= 7) return 'review'
  return 'learning'
}

/** 处理复习结果，更新学习记录 */
export async function processReview(
  wordId: string,
  grade: ReviewGrade
): Promise<LearningRecord> {
  const existing = await db.records.get(wordId)
  const now = Date.now()

  const record: LearningRecord = existing
    ? { ...existing }
    : {
        wordId,
        status: 'new',
        reviewCount: 0,
        correctCount: 0,
        wrongCount: 0,
        lastReviewAt: 0,
        nextReviewAt: 0,
        easeFactor: SM2_CONFIG.initialEase,
        interval: 0,
      }

  record.reviewCount++
  record.lastReviewAt = now

  if (grade >= 2) {
    record.correctCount++
    record.easeFactor = calcEaseFactor(record.easeFactor, grade)
    record.interval = calcNextInterval(record, grade)
  } else {
    record.wrongCount++
    record.easeFactor = Math.max(
      SM2_CONFIG.minEaseFactor,
      record.easeFactor - (grade === 0 ? SM2_CONFIG.againPenalty : SM2_CONFIG.hardPenalty) / 2
    )
    record.interval = 0
  }

  record.nextReviewAt = now + record.interval * 24 * 60 * 60 * 1000
  record.status = getStatus(grade, record.interval)

  await db.records.put(record)

  // 更新每日统计
  const today = new Date().toISOString().slice(0, 10)
  const stats = (await db.dailyStats.get(today)) || {
    date: today,
    newLearned: 0,
    reviewed: 0,
    correct: 0,
    wrong: 0,
  }
  if (!existing || existing.reviewCount === 0) stats.newLearned++
  else stats.reviewed++
  if (grade >= 2) stats.correct++
  else stats.wrong++
  await db.dailyStats.put(stats)

  return record
}

/** 获取今日待复习单词 ID 列表 */
export async function getDueWordIds(): Promise<string[]> {
  const now = Date.now()
  const all = await db.records.toArray()
  return all.filter((r) => r.nextReviewAt <= now).map((r) => r.wordId)
}
