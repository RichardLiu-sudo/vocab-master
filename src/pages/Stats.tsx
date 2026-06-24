import { useEffect, useState } from 'react'
import { db } from '../utils/db'
import type { DailyStats } from '../types/word'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Stats() {
  const [stats, setStats] = useState<DailyStats[]>([])

  useEffect(() => {
    db.dailyStats.orderBy('date').toArray().then(setStats)
  }, [])

  const totalLearned = stats.reduce((s, d) => s + d.newLearned, 0)
  const totalReviewed = stats.reduce((s, d) => s + d.reviewed, 0)
  const totalCorrect = stats.reduce((s, d) => s + d.correct, 0)
  const totalWrong = stats.reduce((s, d) => s + d.wrong, 0)
  const accuracy = totalCorrect + totalWrong > 0
    ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
    : 0

  if (!stats.length) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">暂无学习记录，去背几个单词吧！</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">学习统计</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="已学单词" value={totalLearned} />
        <StatCard label="复习次数" value={totalReviewed} />
        <StatCard label="正确率" value={`${accuracy}%`} />
        <StatCard label="错误数" value={totalWrong} color="text-red-500" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">每日学习趋势</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip />
            <Line type="monotone" dataKey="newLearned" stroke="#3b82f6" strokeWidth={2} name="新学" />
            <Line type="monotone" dataKey="correct" stroke="#22c55e" strokeWidth={2} name="正确" />
            <Line type="monotone" dataKey="wrong" stroke="#ef4444" strokeWidth={2} name="错误" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center">
      <p className={`text-2xl font-bold ${color || 'text-brand-600 dark:text-brand-400'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
