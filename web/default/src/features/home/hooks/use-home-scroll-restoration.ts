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
import { useEffect } from 'react'

const HOME_SCROLL_KEY_PREFIX = '51token:home-scroll:'

function getCurrentScrollKey() {
  return `${HOME_SCROLL_KEY_PREFIX}${window.location.pathname}${window.location.search}`
}

function shouldRestoreScroll() {
  const navigation = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined

  return navigation?.type === 'reload' || navigation?.type === 'back_forward'
}

function readStoredScrollTop(key: string) {
  const value = Number(window.sessionStorage.getItem(key))
  return Number.isFinite(value) && value > 0 ? value : null
}

export function useHomeScrollRestoration(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const key = getCurrentScrollKey()
    let frameId = 0

    const saveScrollPosition = () => {
      window.sessionStorage.setItem(key, String(Math.round(window.scrollY)))
    }

    const handleScroll = () => {
      if (frameId) return

      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        saveScrollPosition()
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pagehide', saveScrollPosition)
    window.addEventListener('beforeunload', saveScrollPosition)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pagehide', saveScrollPosition)
      window.removeEventListener('beforeunload', saveScrollPosition)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    if (window.location.hash || !shouldRestoreScroll()) return

    const targetTop = readStoredScrollTop(getCurrentScrollKey())
    if (targetTop === null) return

    let attempts = 0
    let timeoutId = 0
    let frameId = 0

    const restore = () => {
      attempts += 1
      const maxTop = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      )

      if (maxTop >= targetTop || attempts >= 30) {
        window.scrollTo({
          top: Math.min(targetTop, maxTop),
          left: 0,
          behavior: 'auto',
        })
        return
      }

      timeoutId = window.setTimeout(restore, 50)
    }

    frameId = window.requestAnimationFrame(restore)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [enabled])
}
