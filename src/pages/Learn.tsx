import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import FlashCard from '../components/FlashCard'
import { getWordsByExam } from '../data/wordlists'
import { processReview } from '../utils/spacedRepetition'
import { db } from '../utils/db'
import type { ExamType, Word, LearningRecord } from '../types/word'

interface Settings {
  newWordsPerDay: number
  reviewPerDay: number
}

function loadSettings(): Settings {
  try {
    return {
      newWordsPerDay: 20,
      reviewPerDay: 50,
      ...JSON.parse(localStorage.getItem('vocabmaster-settings') || '{}'),
    }
  } catch {
    return { newWordsPerDay: 20, reviewPerDay: 50 }
  }
}

export default function Learn() {
  const { exam } = useParams<{ exam: string }>()
  const examType = exam as ExamType
  const allWords = useMemo(() => getWordsByExam(examType), [examType])
  const settings = useMemo(() => loadSettings(), [])

  const [loading, setLoading] = useState(true)
  const [newWordsSlice, setNewWordsSlice] = useState<Word[]>([])
  const [dueWordsSlice, setDueWordsSlice] = useState<Word[]>([])
  const [mode, setMode] = useState<'new' | 'review' | 'done'>('new')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function init() {
      setLoading(true)

      const allRecords = await db.records.toArray()
      const recordMap = new Map<string, LearningRecord>(
        allRecords.map((r) => [r.wordId, r])
      )
      const now = Date.now()
      const newWords: Word[] = []
      const dueWords: Word[] = []

      for (const w of allWords) {
        const rec = recordMap.get(w.id)
        if (!rec) {
          newWords.push(w)
        } else if (rec.nextReviewAt <= now) {
          dueWords.push(w)
        }
      }

      const today = new Date().toISOString().slice(0, 10)
      const stats = await db.dailyStats.get(today)
      const todayNew = stats?.newLearned ?? 0
      const todayReview = stats?.reviewed ?? 0

      const newQuota = Math.max(0, settings.newWordsPerDay - todayNew)
      const reviewQuota = Math.max(0, settings.reviewPerDay - todayReview)

      const nSlice = newWords.slice(0, newQuota)
      const dSlice = dueWords.slice(0, reviewQuota)

      if (cancelled) return

      setNewWordsSlice(nSlice)
      setDueWordsSlice(dSlice)

      if (nSlice.length > 0) {
        setMode('new')
      } else if (dSlice.length > 0) {
        setMode('review')
      } else {
        setMode('done')
      }

      setIndex(0)
      setLoading(false)
    }
    init()
    return () => {
      cancelled = true
    }
  }, [examType, allWords, settings])

  const currentWords = mode === 'new' ? newWordsSlice : dueWordsSlice

  const advance = () => {
    const next = index + 1
    if (next >= currentWords.length) {
      if (mode === 'new' && dueWordsSlice.length > 0) {
        setMode('review')
        setIndex(0)
      } else {
        setMode('done')
      }
    } else {
      setIndex(next)
    }
  }

  const handleKnown = async () => {
    if (mode === 'done' || !currentWords[index]) return
    await processReview(currentWords[index].id, 3)
    advance()
  }

  const handleUnknown = async () => {
    if (mode === 'done' || !currentWords[index]) return
    await processReview(currentWords[index].id, 0)
    advance()
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">加载学习记录...</p>
      </div>
    )
  }

  if (!allWords.length) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">该词库暂未收录单词，请联系开发者补充。</p>
        <Link to="/" className="text-brand-500 mt-4 inline-block">
          ← 返回词库选择
        </Link>
      </div>
    )
  }

  if (mode === 'done' || currentWords.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          今日学习已完成
        </h2>
        <p className="text-gray-500 mb-1">
          新词上限 {settings.newWordsPerDay} 个 · 复习上限 {settings.reviewPerDay} 个
        </p>
        {dueWordsSlice.length === 0 && newWordsSlice.length === 0 && (
          <p className="text-sm text-gray-400">当前词库暂无待学内容</p>
        )}
        <p className="text-sm text-gray-400 mt-2 mb-6">明天再来，或换个词库继续学习</p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            换词库
          </Link>
        </div>
      </div>
    )
  }

  const currentWord = currentWords[index]
  const progressLabel = mode === 'new' ? '新词' : '复习'

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/"
          className="text-sm text-gray-400 hover:text-brand-500 transition-colors"
        >
          ← 返回词库选择
        </Link>
      </div>
      <FlashCard
        word={currentWord}
        onKnown={handleKnown}
        onUnknown={handleUnknown}
        progress={{
          current: index + 1,
          total: currentWords.length,
          label: progressLabel,
        }}
      />
    </div>
  )
}
