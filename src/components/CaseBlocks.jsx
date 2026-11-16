import { motion, useReducedMotion } from 'framer-motion'
import Cover from './Cover.jsx'
import BeforeAfter from './BeforeAfter.jsx'
import FlowDemo from './FlowDemo.jsx'

// ---------------------------------------------------------------------------
// Case-study content blocks. A project's `blocks` array (see data/content.js) is a list of:
//   { type: 'text',    heading?, body: string | string[] }
// Two ways to show a set of items, and one rule for choosing:
//   CARDS      separate items you scan as a set, each with a title and a short body, in no order:
//              options, decisions, choices, team roles, result numbers, quotes.      items · stats · voices
//   LINE ITEMS things with an order or a mapping, as hairline rows with a number:
//              steps, "finding -> goal", short lists of changes.                    rows · pairs · list
//   Pills are for tags only (methods, skills), never for content.
//
//   { type: 'list',    heading?, intro?, items: string[] }   <- line items; "**Title.** description" gives a label + text
//   { type: 'items',   heading?, intro?, items: [{ title, body }], columns? }   <- numbered cards
//   { type: 'pairs',   heading?, intro?, items: [{ from, to, body? }] }   <- finding -> goal line items
//   { type: 'stats',   heading?, items: [{ value, label }] }            <- big result number cards
//   { type: 'image',   src?, mock?, caption?, wide? }
//   { type: 'gallery', heading?, images: [{ src?, mock?, caption? }] }
//   { type: 'quote',   text, by? }
//   { type: 'links',   items: [{ label, url }] }
//   { type: 'compare', heading?, kind: 'devices' | 'mfa', real?, caption?, changes?: [{ from, to }] }   <- coded before / after UIs
//   { type: 'flow',    heading?, kind, real?, spots?, caption? }   <- a clickable demo plus the real design
//
// The editorial section style (a project sets `editorial: true`). Every block can carry a `sub` title: an underlined
// subsection title shown above it. New blocks:
//   { type: 'heading', heading }                     <- starts a numbered section: a number badge and a big title
//   { type: 'opener',  body }                        <- the large call-out that opens a section
//   { type: 'callout', sub?, body }                  <- a small call-out with a thin rule on the left
//   { type: 'finding', sub?, text, source?, note? }  <- a big italic line (a finding), a source line, and an optional note
//   { type: 'facts',   sub?, items: [{ label, text }] }               <- a row of 2-4 facts with dividers
//   { type: 'rows',    heading?, sub?, items: [{ label, text, note? }] }   <- line items: number · label · text · note
//   { type: 'voices',  sub?, items: [{ label, text, by?, now? }] }    <- feedback cards: label, text, source, "Now:" line
//   { type: 'cols',    cols: [[block, ...], [block, ...]] }           <- blocks side by side (they stack on a phone)
// In any text, **bold** makes bold text and ==this== makes a highlighted phrase.
// A block with a `heading` becomes an entry in the "on this page" index.
// ---------------------------------------------------------------------------

const toParagraphs = (body) => (Array.isArray(body) ? body : [body])
// **bold** and ==highlight==
const rich = (text) =>
  text.split(/(\*\*.+?\*\*|==.+?==)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>
    if (part.startsWith('==') && part.endsWith('==')) return (
      <mark key={i} className="cs-mark">
        {part.slice(2, -2)}
      </mark>
    )
    return part
  })
const num = (i) => String(i + 1).padStart(2, '0')

function Reveal({ children, className }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

// a section title. With a number (editorial sections) it gets a dark circle with the section number.
const Heading = ({ block, id, sectionNum }) =>
  block.heading ? (
    <h2 id={id} data-sec={id} className={sectionNum != null ? 'cs-h2' : undefined}>
      {sectionNum != null && (
        <span className="cs-badge" aria-hidden="true">
          {String(sectionNum).padStart(2, '0')}
        </span>
      )}
      <span>{block.heading}</span>
    </h2>
  ) : null

// an underlined subsection title
const Sub = ({ block }) =>
  block.sub ? (
    <h3 className="cs-sub">
      <span>{block.sub}</span>
    </h3>
  ) : null

function Figure({ img, project }) {
  const cover = { cover: img.src, mock: img.mock ?? project.mock, title: img.caption ?? project.title }
  return (
    <figure className="cs-fig">
      <div className={`cs-fig__img ${img.src ? 'cs-fig__img--real' : ''} ${img.bare ? 'cs-fig__img--bare' : ''}`} style={{ '--c': img.color ?? project.color }}>
        <Cover p={cover} />
      </div>
      {img.caption && <figcaption>{img.caption}</figcaption>}
    </figure>
  )
}

function Cards({ items, columns = 2 }) {
  return (
    <div className="cs-cards" data-cols={columns} style={{ '--cols': columns }}>
      {items.map((it, i) => (
        <article key={it.title ?? it.body} className="cs-card">
          <span className="cs-card__n mono">{num(i)}</span>
          {it.title && <h3>{it.title}</h3>}
          <p>{rich(it.body)}</p>
        </article>
      ))}
    </div>
  )
}

// The one line-item component: hairline rows, each with a number, an optional label, text and an optional note.
// Used for steps, short lists of changes, and (as `pairs`) finding -> goal. Rows with no labels get a narrow number column.
function LineItems({ items }) {
  const labelled = items.some((r) => r.label)
  const noted = items.some((r) => r.note)
  return (
    <ol className={`cs-rows${labelled ? '' : ' cs-rows--bare'}${labelled && !noted ? ' cs-rows--nonote' : ''}`}>
      {items.map((r, i) => (
        <li key={r.label ?? r.text}>
          <span className="cs-rows__n">
            <i>{num(i)}</i>
            {r.label}
          </span>
          <span className="cs-rows__t">{rich(r.text)}</span>
          {r.note && <span className="cs-rows__note">{r.note}</span>}
        </li>
      ))}
    </ol>
  )
}

export default function CaseBlock({ block, project, sectionId, sectionNum }) {
  const head = <Heading block={block} id={sectionId} sectionNum={sectionNum} />
  const sub = <Sub block={block} />

  switch (block.type) {
    case 'text':
      return (
        <Reveal className="cs-text">
          {head}
          {sub}
          {toParagraphs(block.body).map((t, i) => (
            <p key={i}>{rich(t)}</p>
          ))}
        </Reveal>
      )

    // a short list: line items, a number and the text. "**Title.** text" shows its title in bold.
    case 'list': {
      const items = block.items.map((t) => ({ text: t }))
      return (
        <Reveal className="cs-text">
          {head}
          {sub}
          {block.intro && <p className="cs-intro">{rich(block.intro)}</p>}
          <LineItems items={items} />
        </Reveal>
      )
    }

    case 'items':
      return (
        <Reveal className="cs-text">
          {head}
          {sub}
          {block.intro && <p className="cs-intro">{rich(block.intro)}</p>}
          <Cards items={block.items} columns={block.columns ?? 2} />
        </Reveal>
      )

    case 'pairs':
      return (
        <Reveal className="cs-text">
          {head}
          {sub}
          {block.intro && <p className="cs-intro">{rich(block.intro)}</p>}
          <ol className="cs-rows cs-rows--map">
            {block.items.map((it, i) => (
              <li key={it.from}>
                <span className="cs-rows__n"><i>{num(i)}</i></span>
                <span className="cs-rows__from">{it.from}</span>
                <i className="cs-rows__arrow" aria-hidden="true">→</i>
                <div className="cs-rows__to">
                  <b>{it.to}</b>
                  {it.body && <span>{it.body}</span>}
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      )

    case 'image':
      return (
        <Reveal className={block.wide ? 'cs-wide' : ''}>
          {sub}
          <Figure img={block} project={project} />
        </Reveal>
      )

    case 'gallery':
      return (
        <Reveal className="cs-text">
          {head}
          {sub}
          <div className="cs-gallery">
            {block.images.map((img, i) => (
              <Figure key={i} img={img} project={project} />
            ))}
          </div>
        </Reveal>
      )

    case 'stats':
      return (
        <Reveal className="cs-text">
          {head}
          {sub}
          <div className="cs-statcards">
            {block.items.map((s) => (
              <div key={s.label} className="cs-stat">
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      )

    case 'quote':
      return (
        <Reveal className="cs-quote">
          <blockquote>“{block.text}”</blockquote>
          {block.by && <cite>{block.by}</cite>}
        </Reveal>
      )

    case 'flow':
      return (
        <Reveal className="cs-text cs-compare">
          {head}
          {sub}
          <FlowDemo kind={block.kind} real={block.real} spots={block.spots} caption={block.caption} />
        </Reveal>
      )

    case 'compare':
      return (
        <Reveal className="cs-text cs-compare">
          {head}
          {sub}
          <BeforeAfter kind={block.kind} real={block.real} caption={block.caption} changes={block.changes} />
        </Reveal>
      )

    case 'links':
      return (
        <Reveal className="cs-links">
          {block.items.map((l) => (
            <a key={l.url} className="btn" href={l.url} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </Reveal>
      )

    // ---- the editorial section blocks ----

    case 'heading':
      return <Reveal className="cs-sechead">{head}</Reveal>

    case 'opener':
      return (
        <Reveal className="cs-block">
          <p className="cs-opener">{rich(block.body)}</p>
        </Reveal>
      )

    case 'callout':
      return (
        <Reveal className="cs-block">
          {sub}
          <p className="cs-callout">{rich(block.body)}</p>
        </Reveal>
      )

    case 'finding':
      return (
        <Reveal className="cs-block">
          {sub}
          <p className="cs-finding">{rich(block.text)}</p>
          {block.source && <p className="cs-finding__src">{block.source}</p>}
          {block.note && <p className="cs-callout cs-callout--after">{rich(block.note)}</p>}
        </Reveal>
      )

    case 'facts':
      return (
        <Reveal className="cs-block">
          {sub}
          <dl className="cs-factrow" style={{ '--n': block.items.length }}>
            {block.items.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      )

    case 'rows':
      return (
        <Reveal className={block.heading ? 'cs-text' : 'cs-block'}>
          {head}
          {sub}
          <LineItems items={block.items} />
        </Reveal>
      )

    case 'voices':
      return (
        <Reveal className="cs-block">
          {sub}
          <div className="cs-voices" style={{ '--n': block.items.length }}>
            {block.items.map((v) => (
              <figure key={v.label} className="cs-voice">
                <span className="cs-voice__label">{v.label}</span>
                <p className="cs-voice__text">{v.text}</p>
                {v.now && <p className="cs-voice__now">{v.now}</p>}
                {v.by && <figcaption>{v.by}</figcaption>}
              </figure>
            ))}
          </div>
        </Reveal>
      )

    case 'cols':
      return (
        <div className="cs-cols" style={{ '--n': block.cols.length }}>
          {block.cols.map((col, ci) => (
            <div key={ci} className="cs-col">
              {col.map((b, bi) => (
                <CaseBlock key={bi} block={b} project={project} />
              ))}
            </div>
          ))}
        </div>
      )

    default:
      return null
  }
}
