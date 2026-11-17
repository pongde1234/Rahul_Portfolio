import { Link } from 'react-router-dom'
import Cover from './Cover.jsx'
import { usePageTransition } from './PageTransition.jsx'

export default function ProjectCard({ p, i = 0 }) {
  const { open } = usePageTransition()
  return (
    <Link to={`/works/${p.slug}`} className="pcard" style={{ '--c': p.color, '--r': `${i % 2 ? 0.8 : -0.8}deg` }} onClick={(e) => open(e, p)}>
      <div className="pcard__cover">
        <Cover p={p} />
      </div>
      <div className="pcard__meta">
        <small className="mono">
          {[p.company, p.year].filter(Boolean).join(' · ')}
        </small>
        <h3>{p.title}</h3>
        <div className="chips">
          {p.tags.map((t) => (
            <em key={t}>{t}</em>
          ))}
        </div>
      </div>
    </Link>
  )
}
