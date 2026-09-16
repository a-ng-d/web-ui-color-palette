import { useLocation } from 'preact-iso'
import { useEffect } from 'preact/hooks'
import {
  commons,
  Icon,
  layouts,
  yelboltColors,
  yelboltModes,
  yelboltTypes,
} from '@unoff/ui'
import '@ui-lib/ui/stylesheets/app.css'
import './web-layout.css'
import { useAppState } from '../data/AppStateContext'
import { Sidebar } from './Sidebar'
import { NotificationHost } from './NotificationHost'
import { ModalHost } from './ModalHost'
import { LanguageSuggestionBanner } from './LanguageSuggestionBanner'
import { ConsentHost } from './ConsentHost'
import type { ComponentChildren } from 'preact'
import type { Service } from '@ui-lib/types'

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
  }, [path, setState])
}

export function AppLayout({ children }: AppLayoutProps) {
  useServiceSync()
  const { state } = useAppState()

  if (!state.isLoaded)
    return (
      <div
        id="app"
        className="web-app"
      >
        <div className={layouts.centered}>
          <Icon
            type="PICTO"
            iconName="spinner"
          />
        </div>
      </div>
    )

  return (
    <div
      id="app"
      className="web-app"
    >
      <Sidebar />
      <main inert={state.modalContext !== 'EMPTY' || state.mustUserConsent}>
        {children}
        <LanguageSuggestionBanner />
      </main>
      <NotificationHost />
      <ModalHost />
      <ConsentHost />
    </div>
  )
}
