import { Outlet, Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: '词库', icon: '📖' },
  { path: '/stats', label: '统计', icon: '📊' },
  { path: '/wrong-words', label: '错词本', icon: '📝' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶栏 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">
              VocabMaster
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* 底栏 */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-4">
        <p className="text-center text-xs text-gray-400">
          VocabMaster - 基于 SM-2 间隔重复算法 · 数据存储在本地浏览器
        </p>
      </footer>
    </div>
  )
}
