// The picture of the two-step verification sign-in used on the work list, the home page and the case-study header: three screens
// of the sign-in built from the Faclon design system (sign in, enter the code, signed in), a screenshot of embed.html?demo=signin-banner,
// in a soft green frame. The clickable version is in the case study.
export default function MfaStill() {
  return (
    <div
      className="art"
      role="img"
      aria-label="Two-step verification: sign in, enter the six digit code, and you are signed in"
      style={{ display: 'grid', placeItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, var(--global-emerald-50), var(--global-emerald-100))' }}
    >
      <img
        src={`${import.meta.env.BASE_URL}images/mfa/prototype-still.png`}
        alt=""
        draggable="false"
        style={{ width: '80%', height: 'auto', borderRadius: 10, boxShadow: '0 1px 2px rgba(22,24,29,0.06), 0 14px 32px -12px rgba(22,24,29,0.28)' }}
      />
    </div>
  )
}
