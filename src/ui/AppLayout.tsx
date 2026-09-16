import { useLocation } from 'preact-iso'
import { useEffect } from 'preact/hooks'
import { commons, yelboltColors, yelboltModes, yelboltTypes } from '@unoff/ui'
import 'ui-ui-color-palette/ui/stylesheets/app.css'
import './web-layout.css'
import { useAppState } from '../data/AppStateContext'
import { Sidebar } from './Sidebar'
import { NotificationHost } from './NotificationHost'
import { ModalHost } from './ModalHost'
import { LanguageSuggestionBanner } from './LanguageSuggestionBanner'
import { ConsentHost } from './ConsentHost'
import type { Service } from 'ui-ui-color-palette/types'
import type { ComponentChildren } from 'preact'

if (typeof window !== 'undefined')
  (
    window as unknown as { __unoffThemeTokens: Record<string, unknown> }
  ).__unoffThemeTokens = { commons, yelboltColors, yelboltModes, yelboltTypes }

interface AppLayoutProps {
  children?: ComponentChildren
}

const SERVICE_BY_PATH: Record<string, Service> = {
  '/': 'MANAGE',
  '/manage': 'MANAGE',
  '/gen': 'GEN',
  '/extract': 'EXTRACT',
  '/wheel': 'WHEEL',
  '/explore': 'EXPLORE',
}

function useServiceSync() {
  const { path } = useLocation()
  const { setState } = useAppState()

  useEffect(() => {
    setState({ service: SERVICE_BY_PATH[path] ?? 'MANAGE' })
  }, [path])
}

export function AppLayout({ children }: AppLayoutProps) {
  useServiceSync()
  const { state } = useAppState()

  return (
    <div
      id="app"
      className="web-app"
    >
      <Sidebar />
      <main inert={state.modalContext !== 'EMPTY' || state.mustUserConsent}>
        <LanguageSuggestionBanner />
        {children}
      </main>
      <NotificationHost />
      <ModalHost />
      <ConsentHost />
    </div>
  )
}
