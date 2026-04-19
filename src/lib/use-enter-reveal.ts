import { useEffect, useRef } from 'react'

export function useEnterReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reveals = el.querySelectorAll('.reveal')
    const frame = requestAnimationFrame(() => {
      reveals.forEach((r) => r.classList.add('visible'))
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return ref
}
