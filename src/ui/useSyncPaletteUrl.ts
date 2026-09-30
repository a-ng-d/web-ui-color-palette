import { useEffect, useRef } from 'preact/hooks'
import { $palette } from '@ui-lib/stores'
import { useStore } from '@nanostores/preact'

export function useSyncPaletteUrl() {
  const id = useStore($palette).id as string
  const prevId = useRef<string>('')

  useEffect(() => {
    const hadId = prevId.current
    prevId.current = id

    const current = window.location.pathname + window.location.search

    if (!id) {
      if (!hadId) return
      if (current === '/palettes') return

      window.history.replaceState(null, '', '/palettes')
      return
    }

    const next = `/palettes?id=${encodeURIComponent(id)}`
    if (next === current) return

    window.history.replaceState(null, '', next)
  }, [id])
}
