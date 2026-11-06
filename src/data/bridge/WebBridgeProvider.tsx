import { useEffect } from 'preact/hooks'
import { $userTheme, getUserConsent } from '@ui-lib/stores'
import { useTolgee } from '@tolgee/react'
import { startBridge } from './loadBridge'
import { initDb } from './db'
import { setT } from './context'
import type { ComponentChildren } from 'preact'
import type { UserTheme } from '@ui-lib/types'

const USER_THEME_VALUES: UserTheme[] = ['light', 'dark', 'system']

const EMBED_PARENT_ORIGINS = [
  /^https:\/\/ui-color-palette\.com$/,
  /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/,
  /^http:\/\/localhost:\d+$/,
]

const EMBED_THEME_MESSAGE = 'UICP_SET_THEME'

const isUserTheme = (value: unknown): value is UserTheme =>
  USER_THEME_VALUES.includes(value as UserTheme)

const applyEmbedTheme = (theme: UserTheme) => {
  try {
    window.localStorage.setItem('user_theme', theme)
  } catch {
    // Storage blocked: the theme still applies for this session.
  }
  $userTheme.set(theme)
}

interface WebBridgeProviderProps {
  children: ComponentChildren
}
export function WebBridgeProvider({ children }: WebBridgeProviderProps) {
  const tolgee = useTolgee()

  useEffect(() => {
    setT((key, params) => tolgee.t(key, params as Record<string, string>))

    const params = new URLSearchParams(window.location.search)
    const isEmbed = ['1', 'true'].includes(
      (params.get('embed') ?? '').toLowerCase()
    )
    const embedTheme = params.get('theme')
    if (isEmbed && isUserTheme(embedTheme)) applyEmbedTheme(embedTheme)

    const storedUserTheme = window.localStorage.getItem('user_theme')
    if (isUserTheme(storedUserTheme)) $userTheme.set(storedUserTheme)

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return
      if (!EMBED_PARENT_ORIGINS.some((origin) => origin.test(event.origin)))
        return
      const data = event.data as { type?: unknown; theme?: unknown } | null
      if (data?.type !== EMBED_THEME_MESSAGE || !isUserTheme(data.theme)) return
      applyEmbedTheme(data.theme)
    }
    if (isEmbed) window.addEventListener('message', onMessage)

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

    return () => window.removeEventListener('message', onMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
