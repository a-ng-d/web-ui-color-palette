import { useLocation } from 'preact-iso'
import { useEffect, useRef } from 'preact/hooks'
import { $palette } from '@ui-lib/stores'
import { useStore } from '@nanostores/preact'

export function useSyncPaletteUrl() {
  const { path, route } = useLocation()
  const id = useStore($palette).id as string
  const prevId = useRef<string>('')

  useEffect(() => {
    const hadId = prevId.current
    prevId.current = id

    if (!id) {
      if (!hadId) return

      const next = '/palettes/local'
      if (path !== next) route(next, true)
      return
    }

    const next = `/palettes/${encodeURIComponent(id)}`
    if (path !== next) route(next, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
}
