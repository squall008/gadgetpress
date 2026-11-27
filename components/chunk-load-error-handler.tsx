'use client'

// IMPORTANT: Do not remove this component.
// It handles a known Next.js dev server race condition where dynamic chunks
// imported by next/dynamic haven't been compiled yet and cause webpack to throw
// a ChunkLoadError

import { useEffect } from 'react'

const RELOAD_KEY = 'gp_chunk_reload_at'
const RELOAD_COOLDOWN_MS = 15_000

export function ChunkLoadErrorHandler() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      if (
        event.error?.name === 'ChunkLoadError' ||
        event.error?.message?.includes('Loading chunk')
      ) {
        event.preventDefault()
        try {
          const lastReload = Number(window.sessionStorage.getItem(RELOAD_KEY) || '0')
          if (Date.now() - lastReload < RELOAD_COOLDOWN_MS) {
            return
          }
          window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
        } catch {
          // ignore storage restrictions
        }
        window.location.reload()
      }
    }
    window.addEventListener('error', handler)
    return () => window.removeEventListener('error', handler)
  }, [])

  return null
}
