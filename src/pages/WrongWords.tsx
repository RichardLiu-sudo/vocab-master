import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../utils/db'
import { wordBank } from '../data/wordlists'

export default function WrongWords() {
  const [wrongIds, setWrongIds] = useState<string[]>([])

  useEffect(() => {
    db.records
      .filter((r) => r.wrongCount > 0)
      .toArray()
      .then((records) => {
        setWrongIds(records.sort((a, b) => b.wrongCount - a.wrongCount).map((r) => r.wordId))
      })
  }, [])

  const wrongWords = wrongIds
    .map((id) => wordBank.find((w) => w.id === id))
    .filter(Boolean)

  if (!wrongWords.length) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">暂无错词，继续保持！</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">错词本</h2>
      <div className="space-y-3">
        {wrongWords.map((word) => (
          <div
            key={word!.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">{word!.word}</span>
              <span className="text-gray-400 text-sm ml-2">{word!.phonetic}</span>
              <p className="text-gray-500 text-sm mt-1">{word!.definitionCn}</p>
            </div>
            <Link
              to={`/learn/${word!.examTags[0]}`}
              className="text-brand-500 text-sm hover:underline shrink-0 ml-4"
            >
              重新学习 →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
