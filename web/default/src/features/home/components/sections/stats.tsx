/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useRef, useEffect, useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

interface CounterProps {
  end: number
  duration?: number
  decimals?: number
  formatter?: (value: number) => string
}

function Counter(props: CounterProps) {
  const { end, duration = 1000, decimals = 0, formatter } = props
  const ref = useRef<HTMLSpanElement>(null)
  const startedRef = useRef(false)
  const [displayValue, setDisplayValue] = useState(
    formatter ? formatter(0) : decimals > 0 ? (0).toFixed(decimals) : '0'
  )

  const formatValue = useCallback(
    (v: number) => {
      if (formatter) return formatter(v)
      const value =
        decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
      return value
    },
    [decimals, formatter]
  )

  const animate = useCallback(() => {
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(formatValue(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration, formatValue])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setDisplayValue(formatValue(end))
      return
    }

    if (!startedRef.current) {
      startedRef.current = true
      animate()
    }
  }, [animate, end, formatValue])

  return (
    <span
      ref={ref}
      className='inline-flex min-h-[1.1em] max-w-full items-baseline justify-center overflow-hidden tabular-nums'
      aria-label={displayValue}
    >
      {Array.from(displayValue).map((char, index) => (
        <span
          key={`${index}-${char}`}
          className='relative inline-block h-[1.1em] shrink-0 overflow-hidden'
        >
          <AnimatePresence mode='popLayout' initial={false}>
            <motion.span
              key={char}
              initial={{ y: '80%', rotateX: -80, opacity: 0 }}
              animate={{ y: 0, rotateX: 0, opacity: 1 }}
              exit={{ y: '-80%', rotateX: 80, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className='block min-w-[0.55em]'
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}

interface StatsProps {
  className?: string
}

interface StatItem {
  end?: number
  unit?: string
  label: string
  decimals?: number
  formatter?: (value: number) => string
  value?: string
}

export function Stats(_props: StatsProps) {
  const { t } = useTranslation()

  const stats: StatItem[] = [
    { end: 99.9, unit: '%', label: t('服务可用性'), decimals: 1 },
    {
      end: 120_000_000,
      unit: t('亿次'),
      label: t('累计处理请求'),
      formatter: (value) => (value / 100_000_000).toFixed(1),
    },
    { value: 'ChatGPT', label: t('专业稳定 Codex') },
    { end: 24, unit: '/7', label: t('全天候资源调度') },
    { end: 365, unit: t('天+'), label: t('已稳定运行时长') },
  ]

  return (
    <section className='border-border-light bg-background relative z-10 overflow-hidden border-y py-10 md:py-12'>
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5"
      />
      <div className='container-main relative z-10'>
        <div className='grid w-full grid-cols-2 gap-y-8 md:grid-cols-5 md:gap-y-0'>
          {stats.map((s, index) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className='border-border flex w-full min-w-0 flex-col items-center justify-center overflow-hidden px-4 text-center md:border-l md:px-6 md:first:border-l-0'
            >
              <span className='text-foreground font-display inline-flex max-w-full items-baseline justify-center overflow-hidden text-4xl font-bold tracking-tight whitespace-nowrap md:text-5xl'>
                {s.value ? (
                  s.value
                ) : (
                  <Counter
                    end={s.end ?? 0}
                    decimals={s.decimals}
                    formatter={s.formatter}
                  />
                )}
                {s.unit && (
                  <span className='text-muted-foreground ml-1 text-[0.55em] font-medium tracking-normal'>
                    {s.unit}
                  </span>
                )}
              </span>
              <span className='text-muted-foreground mt-2 block text-sm font-medium md:text-base'>
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
