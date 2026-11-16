import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { profile, projects } from '../data/content.js'

// Keeps the browser tab title and the page description in step with the page being shown, so a tab, a bookmark and a search
// result say where you are ("Work — Rahul"), not the same line everywhere.
const HOME = {
  title: `${profile.name} — ${profile.role}`,
  description: 'Rahul is a senior product designer who simplifies complex IoT workflows. See projects on bulk device upload, two-step verification and a design system.',
}

function metaFor(pathname) {
  if (pathname === '/works') return { title: `Work — ${profile.name}`, description: 'Projects by Rahul, a senior product designer: adding hundreds of devices at once, two-step verification and the Faclon design system.' }
  if (pathname === '/about') return { title: `About — ${profile.name}`, description: 'About Rahul: a senior product designer in Mumbai who designs with care for people.' }
  const slug = pathname.match(/^\/works\/([^/]+)/)?.[1]
  const project = slug && projects.find((p) => p.slug === slug)
  if (project) return { title: `${project.title} — ${profile.name}`, description: project.blurb || HOME.description }
  return HOME
}

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

export default function PageMeta() {
  const { pathname } = useLocation()
  useEffect(() => {
    const { title, description } = metaFor(pathname)
    document.title = title
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[name="twitter:title"]', 'content', title)
    setMeta('meta[name="twitter:description"]', 'content', description)
  }, [pathname])
  return null
}
