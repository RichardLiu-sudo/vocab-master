import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Stats from './pages/Stats'
import WrongWords from './pages/WrongWords'
import Quiz from './pages/Quiz'
import Settings from './pages/Settings'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/learn/:exam" element={<Learn />} />
          <Route path="/quiz/:exam" element={<Quiz />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/wrong-words" element={<WrongWords />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
