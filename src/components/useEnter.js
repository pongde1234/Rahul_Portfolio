import { useReducedMotion } from 'framer-motion'

// Entrance animations for a case study's elements. Spread the result on a motion element:
//   <motion.p {...enter(0.4)}>          fades up (delay in seconds); `from` sets how far it travels: { y: 24 } by default
//   <motion.span {...enter.mask(0.4)}>  slides up from behind a mask (for a big title); put it inside an overflow-hidden parent
// Visitors who prefer reduced motion get nothing: the elements are simply there.
export default function useEnter() {
  const reduce = useReducedMotion()
  const enter = (delay = 0, from = { y: 24 }) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, ...from },
          animate: { opacity: 1, x: 0, y: 0, scale: 1 },
          transition: { duration: 0.75, ease: [0.2, 0.7, 0.2, 1], delay },
        }
  enter.mask = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { y: '110%' },
          animate: { y: '0%' },
          transition: { duration: 0.9, ease: [0.2, 0.7, 0.2, 1], delay },
        }
  return enter
}
