import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Stats from './pages/Stats'
import WrongWords from './pages/WrongWords'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/learn/:exam" element={<Learn />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/wrong-words" element={<WrongWords />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
