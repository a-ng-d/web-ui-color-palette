import { useLocation } from 'preact-iso'
import { useEffect, useRef, useState } from 'preact/hooks'
import { SemanticMessage } from '@unoff/ui'
import { ManagePalette } from '@ui-lib/ui/services'
import { WithConfig, WithTranslation } from '@ui-lib/ui/components'
import { $palette } from '@ui-lib/stores'
import { useTranslate } from '@tolgee/react'
import { useSyncPaletteUrl } from '../ui/useSyncPaletteUrl'
import { resolvePaletteFromUrl } from '../data/urlPalette'
import { useAppState } from '../data/AppStateContext'
/* eslint-disable @typescript-eslint/no-explicit-any -- HOC wrappers erase the wrapped component's prop types */
const WrappedManagePalette = WithConfig(
  WithTranslation(ManagePalette as any) as any
) as any
/* eslint-enable @typescript-eslint/no-explicit-any */

const DEFAULT_PATH = '/palettes/local'

const CONTEXT_BY_SLUG = {
  local: 'LOCAL_PALETTES',
  library: 'REMOTE_PALETTES',
} as const

const SLUG_BY_CONTEXT = {
  LOCAL_PALETTES: 'local',
  REMOTE_PALETTES: 'library',
} as const

export default function ManagePage() {
  const { state, managePaletteRef } = useAppState()
  const { path, route } = useLocation()
  const currentUserId = state.userSession.userId
  const { t } = useTranslate()

  const segment = decodeURIComponent(path.split('/')[2] ?? '')
  const isBrowseSlug = segment === 'local' || segment === 'library'

  const [isAccessDenied, setIsAccessDenied] = useState(false)

  const lastResolved = useRef<string | null>(null)

  useEffect(() => {
    if (!segment) {
      route(DEFAULT_PATH, true)
      return
    }
    if (isBrowseSlug) {
      lastResolved.current = null
      setIsAccessDenied(false)
      if ($palette.get().id) managePaletteRef.current?.onResetPalette()
      return
    }
    if (segment === $palette.get().id) return

    const search = window.location.search
    const key = `${segment}${search}`
    if (key === lastResolved.current) return

    resolvePaletteFromUrl(segment, search, currentUserId)
      .then((result) => {
        if (result !== 'blocked') lastResolved.current = key
        setIsAccessDenied(result === 'blocked')
        if (result === 'not-found') route(DEFAULT_PATH, true)
      })
      .catch((error) => {
        console.error('[manage] Deep link failed:', error)
        route(DEFAULT_PATH, true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment, currentUserId])

  useSyncPaletteUrl()

  if (!segment) return null

  return (
    <div className="web-manage-page">
      {isAccessDenied && (
        <div className="web-access-denied">
          <SemanticMessage
            type="WARNING"
            message={t('error.paletteAccessDenied')}
          />
        </div>
      )}
      <WrappedManagePalette
        ref={managePaletteRef}
        {...state}
        appData={state}
        browseContext={
          isBrowseSlug
            ? CONTEXT_BY_SLUG[segment as 'local' | 'library']
            : undefined
        }
        onChangeBrowseContext={(context: keyof typeof SLUG_BY_CONTEXT) => {
          const slug = SLUG_BY_CONTEXT[context]
          if (isBrowseSlug && segment !== slug) route(`/palettes/${slug}`)
        }}
      />
    </div>
  )
}
