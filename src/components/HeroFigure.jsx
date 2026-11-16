// Original line-art figure for the headline note (swap with your own illustration anytime).
export default function HeroFigure() {
  return (
    <svg className="figure" viewBox="0 0 120 230" fill="none" stroke="#1d2433" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* steam */}
      <path d="M24 60c-4 5 4 8 0 14M34 56c-4 5 4 8 0 14" strokeWidth="1.8" />
      {/* neck */}
      <path d="M54 66v10h14V66" fill="#fff" />
      {/* head */}
      <path d="M45 44c0 16 7 26 16 26s16-10 16-26c-9-5-23-5-32 0z" fill="#fff" />
      {/* ear */}
      <path d="M45 46c-4 0-4 8 0 8" strokeWidth="1.8" />
      {/* short hair */}
      <path d="M44 46c-3-16 6-27 19-26 13 1 18 12 14 26-1-7-5-11-9-12-8 3-17 3-24 0-1 3-1 8 0 12z" fill="#1d2433" />
      {/* beard */}
      <path d="M46 52c1 13 7 20 15 20s14-7 15-20c-3 7-8 10-15 10s-12-3-15-10z" fill="#1d2433" />
      {/* smile */}
      <path d="M56 61q5 3 10 0" stroke="#fff" strokeWidth="1.8" />
      {/* torso: t-shirt */}
      <path d="M36 82c14-8 34-8 48 0l5 38H31z" fill="#fff" />
      <path d="M52 78q9 8 18 0" strokeWidth="1.8" />
      {/* arm + mug */}
      <path d="M38 88c-14 8-14 24 6 22" />
      <rect x="30" y="98" width="14" height="16" rx="3" fill="#1d2433" />
      <path d="M44 103h4a4 4 0 0 1 0 8h-4" />
      {/* backpack strap + bag */}
      <path d="M84 86c12 6 14 24 6 34" />
      <rect x="80" y="110" width="20" height="26" rx="4" fill="#1d2433" />
      {/* straight trousers */}
      <path d="M32 120h56l8 100H68l-7-72-7 72H24z" fill="#1d2433" />
      {/* sneakers */}
      <path d="M18 222h36M66 222h38" />
    </svg>
  )
}
