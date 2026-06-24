import WordListSelector from '../components/WordListSelector'

export default function Home() {
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
      <WordListSelector />

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
