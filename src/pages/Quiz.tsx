import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getWordsByExam } from '../data/wordlists'
import { processReview } from '../utils/spacedRepetition'
import type { ExamType } from '../types/word'
import type { Word } from '../types/word'

const EXAM_LABELS: Record<string, string> = {
  toefl: 'TOEFL',
  gre: 'GRE',
  sat: 'SAT',
  ssat: 'SSAT',
}

interface QuizResult {
  selectedIndex: number
  correctIndex: number
  isCorrect: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getQuestionCount(): number {
  try {
    const raw = localStorage.getItem('vocabmaster-settings')
    if (raw) {
      const s = JSON.parse(raw)
      return s.quizCount || 20
    }
  } catch {}
  return 20
}

function getDistractors(correctWord: Word, pool: Word[], count: number): string[] {
  const others = pool.filter((w) => w.id !== correctWord.id && w.definitionCn)
  const shuffled = shuffle(others)
  const distractors: string[] = []
  for (const w of shuffled) {
    if (distractors.length >= count) break
    const def = w.definitionCn
    if (def && !distractors.includes(def) && def !== correctWord.definitionCn) {
      distractors.push(def)
    }
  }
  // 如果干扰项不够，补几个
  while (distractors.length < count) {
    distractors.push('——')
  }
  return distractors
}

export default function Quiz() {
  const { exam } = useParams<{ exam: string }>()
  const navigate = useNavigate()
  const examType = exam as ExamType
  const label = EXAM_LABELS[examType] || examType.toUpperCase()

  const pool = useMemo(() => getWordsByExam(examType), [examType])
  const questionCount = getQuestionCount()

  const [questions, setQuestions] = useState<
    { word: Word; options: string[]; correctIndex: number }[]
  >([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<QuizResult[]>([])
  const [startTime] = useState(Date.now())
  const [finished, setFinished] = useState(false)

  // 生成题目
  useEffect(() => {
    if (pool.length === 0) return
    const count = Math.min(questionCount, pool.length)
    const selected = shuffle(pool).slice(0, count)
    const qs = selected.map((word) => {
      const distractors = getDistractors(word, pool, 3)
      const options = shuffle([word.definitionCn, ...distractors])
      const correctIndex = options.indexOf(word.definitionCn)
      return { word, options, correctIndex }
    })
    setQuestions(qs)
    setCurrentIndex(0)
    setResults([])
    setFinished(false)
  }, [pool, questionCount])

  const handleSelect = useCallback(
    (optionIndex: number) => {
      const q = questions[currentIndex]
      if (!q) return
      const isCorrect = optionIndex === q.correctIndex
      setResults((prev) => [
        ...prev,
        { selectedIndex: optionIndex, correctIndex: q.correctIndex, isCorrect },
      ])
      // 答对标记为已掌握(grade=4)，答错重置学习进度(grade=0)
      processReview(q.word.id, isCorrect ? 4 : 0)
    },
    [currentIndex, questions],
  )

  // 0.8 秒后自动下一题
  useEffect(() => {
    if (results.length === 0) return
    const lastResult = results[results.length - 1]
    if (lastResult === undefined) return
    const timer = setTimeout(() => {
      if (results.length >= questions.length) {
        setFinished(true)
      } else {
        setCurrentIndex((i) => i + 1)
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [results, questions.length])

  // 键盘快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (finished) return
      const lastResult = results.length > 0 ? results[results.length - 1] : null
      // 如果当前题已答（正在等待自动跳转），忽略按键
      if (lastResult !== null && results.length === currentIndex + 1) return
      const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 }
      if (e.key in keyMap) {
        handleSelect(keyMap[e.key])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [finished, currentIndex, results, handleSelect])

  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m} 分 ${sec} 秒` : `${sec} 秒`
  }

  if (!pool.length) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">该词库暂未收录单词，无法进行测验。</p>
        <Link to="/" className="text-brand-500 mt-4 inline-block">
          ← 返回词库选择
        </Link>
      </div>
    )
  }

  if (finished) {
    const correctCount = results.filter((r) => r.isCorrect).length
    const total = results.length
    const rate = total > 0 ? Math.round((correctCount / total) * 100) : 0
    const wrongWordIds = results
      .map((r, i) => (!r.isCorrect ? questions[i]?.word : null))
      .filter(Boolean) as Word[]

    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">{rate >= 80 ? '🎉' : rate >= 60 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">测验完成</h2>
        <p className="text-gray-500 mb-6">
          {label} · {total} 题
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">{correctCount}</div>
            <div className="text-xs text-gray-500">正确</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-500">{total - correctCount}</div>
            <div className="text-xs text-gray-500">错误</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-brand-500">{rate}%</div>
            <div className="text-xs text-gray-500">正确率</div>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-8">用时 {formatTime(elapsed)}</p>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => {
              setCurrentIndex(0)
              setResults([])
              setFinished(false)
              const count = Math.min(questionCount, pool.length)
              const selected = shuffle(pool).slice(0, count)
              const qs = selected.map((word) => {
                const distractors = getDistractors(word, pool, 3)
                const options = shuffle([word.definitionCn, ...distractors])
                const correctIndex = options.indexOf(word.definitionCn)
                return { word, options, correctIndex }
              })
              setQuestions(qs)
            }}
            className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            再来一组
          </button>
          {wrongWordIds.length > 0 && (
            <Link
              to="/wrong-words"
              className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              查看错题
            </Link>
          )}
          <Link
            to="/"
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            返回词库
          </Link>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">准备题目中...</p>
      </div>
    )
  }

  const q = questions[currentIndex]
  if (!q) return null

  const latestResult =
    results.length > 0 && results.length === currentIndex + 1
      ? results[results.length - 1]
      : null

  return (
    <div className="max-w-xl mx-auto">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">
          ← 返回词库
        </Link>
        <span className="text-sm font-medium px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
          {label}
        </span>
        <span className="text-sm text-gray-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* 进度条 */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 题目 */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{q.word.word}</h3>
        {q.word.phonetic && (
          <p className="text-sm text-gray-400 font-mono">{q.word.phonetic}</p>
        )}
      </div>

      {/* 选项 */}
      <div className="grid grid-cols-1 gap-3">
        {q.options.map((opt, i) => {
          let btnStyle =
            'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20'

          if (latestResult) {
            if (i === latestResult.correctIndex) {
              btnStyle =
                'border border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            } else if (i === latestResult.selectedIndex && !latestResult.isCorrect) {
              btnStyle =
                'border border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            } else {
              btnStyle =
                'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-600'
            }
          }

          return (
            <button
              key={i}
              onClick={() => {
                if (!latestResult) handleSelect(i)
              }}
              disabled={!!latestResult}
              className={`relative w-full text-left px-5 py-4 rounded-xl transition-all text-base ${btnStyle}`}
            >
              <span className="inline-block w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 text-center leading-7 mr-3">
                {i + 1}
              </span>
              {opt}
              {latestResult && i === latestResult.correctIndex && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-lg">
                  ✓
                </span>
              )}
              {latestResult && i === latestResult.selectedIndex && !latestResult.isCorrect && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-lg">
                  ✗
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 键盘提示 */}
      <p className="text-center text-xs text-gray-400 mt-6">按键盘 1 / 2 / 3 / 4 快速选择</p>
    </div>
  )
}
