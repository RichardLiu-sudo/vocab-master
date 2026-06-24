import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import WordListSelector from '../components/WordListSelector'
import type { ExamProgress } from '../components/WordListSelector'
import { wordBank } from '../data/wordlists'
import { db } from '../utils/db'
import type { ExamType } from '../types/word'

const QUIZ_EXAMS = [
  { key: 'toefl', label: 'TOEFL', color: 'from-blue-500 to-cyan-500' },
  { key: 'gre', label: 'GRE', color: 'from-purple-500 to-pink-500' },
  { key: 'sat', label: 'SAT', color: 'from-orange-500 to-red-500' },
  { key: 'ssat', label: 'SSAT', color: 'from-emerald-500 to-teal-500' },
]

const ALL_EXAMS: ExamType[] = ['toefl', 'gre', 'sat', 'ssat']

export default function Home() {
  const [progress, setProgress] = useState<Partial<Record<ExamType, ExamProgress>>>({})

  useEffect(() => {
    async function loadProgress() {
      const allRecords = await db.records.toArray()
      const recordMap = new Map(allRecords.map((r) => [r.wordId, r]))
      const now = Date.now()

      const result: Partial<Record<ExamType, ExamProgress>> = {}
      for (const exam of ALL_EXAMS) {
        result[exam] = { learned: 0, due: 0 }
      }

      for (const w of wordBank) {
        const rec = recordMap.get(w.id)
        if (!rec) continue
        for (const exam of w.examTags) {
          const p = result[exam]!
          p.learned++
          if (rec.nextReviewAt <= now) p.due++
        }
      }

      setProgress(result)
    }
    loadProgress()
  }, [])

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          选择词库开始学习
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          支持托福 / GRE / SAT / SSAT 四大考试词库，英英释义 + 中文释义 + 同义词反义词全覆盖
        </p>
      </div>
      <WordListSelector progress={progress} />

      {/* 快速测验入口 */}
      <div className="mt-10 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          快速测验
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUIZ_EXAMS.map(({ key, label, color }) => (
            <Link
              key={key}
              to={`/quiz/${key}`}
              className={`bg-gradient-to-r ${color} text-white py-3 px-4 rounded-xl text-sm font-medium text-center hover:shadow-lg hover:-translate-y-0.5 transition-all`}
            >
              {label} 测验
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-12 max-w-2xl mx-auto grid grid-cols-3 gap-4 text-center">
        {[
          { title: '间隔重复', desc: 'SM-2 算法自动安排复习' },
          { title: '多维释义', desc: '英英/中文/同义/反义' },
          { title: '本地存储', desc: '数据在浏览器，无需登录' },
        ].map((feat) => (
          <div key={feat.title} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{feat.title}</h3>
            <p className="text-xs text-gray-500">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
