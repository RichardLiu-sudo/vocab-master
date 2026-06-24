import { Link } from 'react-router-dom'
import type { ExamType } from '../types/word'
import { wordlistMap } from '../data/wordlists'

const examColors: Record<ExamType, string> = {
  toefl: 'from-blue-500 to-cyan-500',
  gre: 'from-purple-500 to-pink-500',
  sat: 'from-orange-500 to-red-500',
  ssat: 'from-emerald-500 to-teal-500',
}

const examIcons: Record<ExamType, string> = {
  toefl: '🎓',
  gre: '📚',
  sat: '✏️',
  ssat: '🏫',
}

export interface ExamProgress {
  learned: number
  due: number
}

interface Props {
  progress?: Partial<Record<ExamType, ExamProgress>>
}

export default function WordListSelector({ progress }: Props) {
  const exams = Object.entries(wordlistMap) as [ExamType, (typeof wordlistMap)[ExamType]][]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {exams.map(([key, info]) => {
        const prog = progress?.[key]
        const hasDue = prog && prog.due > 0

        return (
          <Link
            key={key}
            to={`/learn/${key}`}
            className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${examColors[key]} text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group`}
          >
            <div className="absolute top-3 right-3 text-3xl opacity-30 group-hover:opacity-50 transition-opacity">
              {examIcons[key]}
            </div>
            <h3 className="text-2xl font-bold mb-1">{info.name}</h3>
            <p className="text-white/80 text-sm mb-3">{info.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/20 rounded-full px-3 py-1 text-xs">
                {info.count.toLocaleString()} 词
              </span>
              {prog && (
                <span className="bg-white/20 rounded-full px-3 py-1 text-xs">
                  已学 {prog.learned} / {info.count.toLocaleString()}
                </span>
              )}
              {hasDue && (
                <span className="bg-yellow-400/80 text-yellow-900 rounded-full px-3 py-1 text-xs font-semibold animate-pulse">
                  待复习 {prog.due}
                </span>
              )}
              <span className="text-white/60 text-xs">→ 开始学习</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
