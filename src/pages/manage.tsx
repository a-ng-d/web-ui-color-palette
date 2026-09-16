import { ManagePalette } from 'ui-ui-color-palette/ui/services'
import { WithConfig, WithTranslation } from 'ui-ui-color-palette/ui/components'
import { useEffect, useRef, useState } from 'preact/hooks'
import { SemanticMessage } from '@unoff/ui'
import { useTranslate } from '@tolgee/react'
import { useSyncPaletteUrl } from '../ui/useSyncPaletteUrl'
import { resolvePaletteFromUrl } from '../data/urlPalette'
import { useAppState } from '../data/AppStateContext'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedManagePalette = WithConfig(
  WithTranslation(ManagePalette as any) as any
) as any

export default function ManagePage() {
  const { state, managePaletteRef } = useAppState()
  const currentUserId = state.userSession.userId
  const { t } = useTranslate()

  const [isAccessDenied, setIsAccessDenied] = useState(false)

  const lastResolvedSearch = useRef<string | null>(null)

  useEffect(() => {
    const search = window.location.search
    if (!search) return
    if (search === lastResolvedSearch.current) return

    resolvePaletteFromUrl(search, currentUserId)
      .then((result) => {
        if (result !== 'blocked') lastResolvedSearch.current = search
        setIsAccessDenied(result === 'blocked')
      })
      .catch((error) => console.error('[manage] Deep link failed:', error))
  }, [currentUserId])

  useSyncPaletteUrl()
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
      />
    </div>
  )
}
