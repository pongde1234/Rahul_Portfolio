import { useEffect } from 'react'
import { Routes, Route, useLocation, useParams } from 'react-router-dom'
import { PageTransitionProvider } from './components/PageTransition.jsx'
import Nav from './components/Nav.jsx'
import PageMeta from './components/PageMeta.jsx'
import Cursors from './components/Cursors.jsx'
import Rulers from './components/Rulers.jsx'
import Home from './pages/Home.jsx'
import Works from './pages/Works.jsx'
import Project from './pages/Project.jsx'
import About from './pages/About.jsx'
import { profile } from './data/content.js'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// keyed by the case study, so going from one to the next plays the entrance animation again
function ProjectRoute() {
  const { slug } = useParams()
  return <Project key={slug} />
}

export default function App() {
  return (
    <PageTransitionProvider>
      <Cursors />
      <Rulers />
      <ScrollTop />
      <PageMeta />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/works" element={<Works />} />
          <Route path="/works/:slug" element={<ProjectRoute />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="hand">Made with coffee & React</span>
      </footer>
    </PageTransitionProvider>
  )
}
