import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import FlashCard from '../components/FlashCard'
import { getWordsByExam } from '../data/wordlists'
import { processReview } from '../utils/spacedRepetition'
import type { ExamType } from '../types/word'

export default function Learn() {
  const { exam } = useParams<{ exam: string }>()
  const examType = exam as ExamType
  const words = useMemo(() => getWordsByExam(examType), [examType])
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    setIndex(0)
    setFinished(false)
  }, [examType])

  if (!words.length) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">该词库暂未收录单词，请联系开发者补充。</p>
        <Link to="/" className="text-brand-500 mt-4 inline-block">← 返回词库选择</Link>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">本轮学习完成</h2>
        <p className="text-gray-500 mb-6">已复习 {words.length} 个单词</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setIndex(0); setFinished(false) }}
            className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            再来一轮
          </button>
          <Link
            to="/"
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            换词库
          </Link>
        </div>
      </div>
    )
  }

  const currentWord = words[index]

  const handleKnown = async () => {
    await processReview(currentWord.id, 3)
    goNext()
  }

  const handleUnknown = async () => {
    await processReview(currentWord.id, 0)
    goNext()
  }

  const goNext = () => {
    if (index + 1 >= words.length) {
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">
          ← 返回词库选择
        </Link>
      </div>
      <FlashCard
        word={currentWord}
        onKnown={handleKnown}
        onUnknown={handleUnknown}
        progress={{ current: index + 1, total: words.length }}
      />
    </div>
  )
}
