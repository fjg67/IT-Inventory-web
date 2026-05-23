import { useEffect, useState } from 'react'

export const useCountUp = (target: number, duration = 600, delay = 0) => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined

    const timeoutId = setTimeout(() => {
      const startTime = Date.now()
      intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(target * eased))

        if (progress >= 1 && intervalId) {
          clearInterval(intervalId)
        }
      }, 16)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [target, duration, delay])

  return value
}
