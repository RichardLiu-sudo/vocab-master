import { useState, useEffect } from 'react'

interface SettingsData {
  dailyNewWords: number
  dailyReviewLimit: number
  direction: 'en-cn' | 'cn-en' | 'mixed'
  quizCount: number
}

const DEFAULTS: SettingsData = {
  dailyNewWords: 20,
  dailyReviewLimit: 50,
  direction: 'en-cn',
  quizCount: 20,
}

function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem('vocabmaster-settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULTS, ...parsed }
    }
  } catch {}
  return { ...DEFAULTS }
}

function saveSettings(data: SettingsData) {
  localStorage.setItem('vocabmaster-settings', JSON.stringify(data))
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>(loadSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    saveSettings(settings)
    setSaved(true)
    const t = setTimeout(() => setSaved(false), 2000)
    return () => clearTimeout(t)
  }, [settings])

  const update = (patch: Partial<SettingsData>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  const reset = () => {
    setSettings({ ...DEFAULTS })
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">设置</h1>

      {/* 每日新词数量 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            每日新词数量
          </label>
          <span className="text-sm font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded">
            {settings.dailyNewWords}
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={50}
          step={5}
          value={settings.dailyNewWords}
          onChange={(e) => update({ dailyNewWords: Number(e.target.value) })}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>5</span>
          <span>50</span>
        </div>
      </div>

      {/* 每日复习上限 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            每日复习上限
          </label>
          <span className="text-sm font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded">
            {settings.dailyReviewLimit}
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={200}
          step={10}
          value={settings.dailyReviewLimit}
          onChange={(e) => update({ dailyReviewLimit: Number(e.target.value) })}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10</span>
          <span>200</span>
        </div>
      </div>

      {/* 学习方向 */}
      <div className="mb-8">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
          学习方向
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'en-cn', label: '英 → 中' },
            { value: 'cn-en', label: '中 → 英' },
            { value: 'mixed', label: '混合' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ direction: opt.value })}
              className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                settings.direction === opt.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 测验题数 */}
      <div className="mb-10">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
          测验题数
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[10, 20, 30, 50].map((n) => (
            <button
              key={n}
              onClick={() => update({ quizCount: n })}
              className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                settings.quizCount === n
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {n} 题
            </button>
          ))}
        </div>
      </div>

      {/* 保存状态 & 恢复默认 */}
      <div className="flex items-center justify-between">
        <span
          className={`text-sm transition-opacity ${saved ? 'text-green-500 opacity-100' : 'opacity-0'}`}
        >
          已自动保存
        </span>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          恢复默认
        </button>
      </div>
    </div>
  )
}
