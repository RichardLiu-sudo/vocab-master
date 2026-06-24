import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Word } from '../types/word'

interface Props {
  word: Word
  onKnown: () => void
  onUnknown: () => void
  progress: { current: number; total: number }
}

export default function FlashCard({ word, onKnown, onUnknown, progress }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [direction, setDirection] = useState(0)

  const handleSwipe = (known: boolean) => {
    setDirection(known ? 1 : -1)
    setTimeout(() => {
      setFlipped(false)
      setDirection(0)
      known ? onKnown() : onUnknown()
    }, 200)
  }

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handleSwipe(false)
    if (e.key === 'ArrowRight') handleSwipe(true)
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      setFlipped((f) => !f)
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[70vh] outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* 进度条 */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{progress.current} / {progress.total}</span>
          <span>{Math.round((progress.current / progress.total) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-500 rounded-full"
            animate={{ width: `${(progress.current / progress.total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 卡片 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={word.id}
          initial={{ opacity: 0, x: direction * 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 300 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
        >
          <div
            className={`card-3d cursor-pointer ${flipped ? 'card-flipped' : ''}`}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className="card-inner relative min-h-[320px]">
              {/* 正面：单词 */}
              <div className="card-front absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-400 mb-3">{word.partOfSpeech}</span>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                  {word.word}
                </h2>
                <p className="text-lg text-gray-500 mb-2">{word.phonetic}</p>
                <button
                  className="mt-2 text-brand-500 hover:text-brand-600 text-2xl"
                  onClick={(e) => {
                    e.stopPropagation()
                    const utterance = new SpeechSynthesisUtterance(word.word)
                    utterance.lang = 'en-US'
                    speechSynthesis.speak(utterance)
                  }}
                >
                  🔊
                </button>
                <p className="text-xs text-gray-400 mt-6">点击翻转查看释义 | ← → 标记认识/不认识</p>
              </div>

              {/* 背面：释义 */}
              <div className="card-back absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 overflow-y-auto">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                  {word.word}
                </h3>

                <Section title="英文释义">{word.definitionEn}</Section>
                <Section title="中文释义">{word.definitionCn}</Section>

                {word.synonyms.length > 0 && (
                  <Section title="同义词">
                    <div className="flex flex-wrap gap-1.5">
                      {word.synonyms.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {word.antonyms.length > 0 && (
                  <Section title="反义词">
                    <div className="flex flex-wrap gap-1.5">
                      {word.antonyms.map((a) => (
                        <span key={a} className="px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                <Section title="例句">
                  <p className="text-gray-700 dark:text-gray-300 italic">"{word.exampleSentence}"</p>
                  <p className="text-gray-500 text-sm mt-1">{word.exampleTranslation}</p>
                </Section>

                {word.rootAffix && (
                  <Section title="词根词缀">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{word.rootAffix}</p>
                  </Section>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 底部操作按钮 */}
      <div className="flex gap-8 mt-8">
        <button
          onClick={() => handleSwipe(false)}
          className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/60 text-2xl flex items-center justify-center transition-colors shadow-md"
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe(true)}
          className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 text-green-500 hover:bg-green-200 dark:hover:bg-green-900/60 text-2xl flex items-center justify-center transition-colors shadow-md"
        >
          ✓
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{title}</h4>
      <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  )
}
