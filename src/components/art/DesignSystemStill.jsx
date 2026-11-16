// The picture of the Faclon design system used on the work list and the home page: the three layers (tokens, components, apps and
// dashboards), a screenshot of the live banner (components/art/DesignSystemBanner.jsx). A picture keeps the design system's large
// stylesheet off the pages that only need this thumbnail; the case study has the real prototype.
export default function DesignSystemStill() {
  return (
    <div
      className="art"
      role="img"
      aria-label="The Faclon design system in three layers: tokens for color, type and spacing, components built from them, and apps and dashboards built from the components by people or by Bruce, our AI"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <img
        src={`${import.meta.env.BASE_URL}images/fds/thumb.webp`}
        alt=""
        draggable="false"
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.012)' }}
      />
    </div>
  )
}
