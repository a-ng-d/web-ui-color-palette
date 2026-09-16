import { useEffect } from 'preact/hooks'
import { $userTheme, getUserConsent } from '@ui-lib/stores'
import { useTolgee } from '@tolgee/react'
import { startBridge } from './loadBridge'
import { initDb } from './db'
import { setT } from './context'
import type { ComponentChildren } from 'preact'
import type { UserTheme } from '@ui-lib/types'

const USER_THEME_VALUES: UserTheme[] = ['light', 'dark', 'system']

interface WebBridgeProviderProps {
  children: ComponentChildren
}
export function WebBridgeProvider({ children }: WebBridgeProviderProps) {
  const tolgee = useTolgee()

  useEffect(() => {
    setT((key, params) => tolgee.t(key, params as Record<string, string>))

    const storedUserTheme = window.localStorage.getItem('user_theme')
    if (USER_THEME_VALUES.includes(storedUserTheme as UserTheme))
      $userTheme.set(storedUserTheme as UserTheme)

    initDb()
      .then(() => startBridge())
      .then(() => {
        window.dispatchEvent(
          new CustomEvent('pluginMessage', {
            detail: {
              message: {
                pluginMessage: {
                  type: 'LOAD_DATA',
                  data: { userConsent: getUserConsent(tolgee.t) },
                },
              },
              targetOrigin: '*',
            },
          })
        )
      })
      .catch((err) =>
        console.error('[WebBridgeProvider] Failed to initialise bridge:', err)
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
