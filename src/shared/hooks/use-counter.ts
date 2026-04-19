import { useState, useEffect, useRef } from 'react'

export function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return

    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      setCount(Math.floor(start))
      if (start >= target) clearInterval(timer)
    }, 16)

    return () => clearInterval(timer)
  }, [started, target, duration])

  return { count, ref }
}

export function formatCount(count: number, suffix: string) {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k' + suffix
  }
  return count + suffix
}
