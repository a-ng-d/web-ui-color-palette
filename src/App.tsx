import { lazy, Suspense } from 'preact/compat'
import type { ComponentType } from 'preact'
import { Router, Route, LocationProvider } from 'preact-iso'
import { TolgeeProvider } from '@tolgee/react'
import { ConfigProvider } from 'ui-ui-color-palette/config'
import { ThemeProvider } from 'ui-ui-color-palette/config'
import { initTolgee } from 'ui-ui-color-palette/external/translation'
import { AppLayout } from './ui/AppLayout'
import { AppStateProvider } from './data/AppStateContext'

// Translation assets (imported once at module level)
import enUS from 'ui-ui-color-palette/translations/en-US.json'
import frFR from 'ui-ui-color-palette/translations/fr-FR.json'
import ptBR from 'ui-ui-color-palette/translations/pt-BR.json'
import zhHansCN from 'ui-ui-color-palette/translations/zh-Hans-CN.json'
import esES from 'ui-ui-color-palette/translations/es-ES.json'
import jaJP from 'ui-ui-color-palette/translations/ja-JP.json'
import koKR from 'ui-ui-color-palette/translations/ko-KR.json'
import webConfig from './data/webConfig'

// lazyRoute wraps each lazy component in its own <Suspense> so preact-iso's
// Router never sees the suspension. Without this, the Router's __c handler
// marks the VNode with MODE_SUSPENDED; when url doesn't change after the
// Promise resolves, useMemo returns a cached value and the stale VNode is
// never committed — leaving a blank page on direct load or first navigation.
// With <Suspense> in between, Suspense catches the Promise first, handles
// the re-render itself, and the Router stays unaware of the lazy loading.
function lazyRoute<T extends Record<string, unknown>>(
  factory: () => Promise<{ default: ComponentType<T> }>
): ComponentType<T> {
  const Lazy = lazy(factory)
  return (props: T) => (
    <Suspense fallback={null}>
      <Lazy {...props} />
    </Suspense>
  )
}

const ManagePage  = lazyRoute(() => import('./pages/manage'))
const GenPage     = lazyRoute(() => import('./pages/gen'))
const ExtractPage = lazyRoute(() => import('./pages/extract'))
const WheelPage   = lazyRoute(() => import('./pages/wheel'))
const ExplorePage = lazyRoute(() => import('./pages/explore'))

// Tolgee initialised once at module level (survives HMR re-renders)
const tolgee = initTolgee(
  import.meta.env.VITE_TOLGEE_URL ?? '',
  import.meta.env.VITE_TOLGEE_API_KEY ?? '',
  'en-US',
  {
    'en-US': enUS,
    'fr-FR': frFR,
    'pt-BR': ptBR,
    'zh-Hans-CN': zhHansCN,
    'es-ES': esES,
    'ja-JP': jaJP,
    'ko-KR': koKR,
  }
)

export function App() {
  return (
    <TolgeeProvider
      tolgee={tolgee}
      fallback="..."
    >
      <ConfigProvider
        limits={webConfig.limits}
        env={webConfig.env}
        plan={webConfig.plan}
        dbs={webConfig.dbs}
        urls={webConfig.urls}
        versions={webConfig.versions}
        features={webConfig.features}
        lang={webConfig.lang}
        fees={webConfig.fees}
      >
        <ThemeProvider
          theme={webConfig.env.ui}
          mode={webConfig.env.colorMode}
        >
          <AppStateProvider>
          <LocationProvider>
            <AppLayout>
              <Router>
                <Route path="/"         component={() => { if (typeof window !== 'undefined') window.location.replace('/manage'); return null }} />
                <Route path="/manage"   component={ManagePage} />
                <Route path="/gen"      component={GenPage} />
                <Route path="/extract"  component={ExtractPage} />
                <Route path="/wheel"    component={WheelPage} />
                <Route path="/explore"  component={ExplorePage} />
              </Router>
            </AppLayout>
          </LocationProvider>
          </AppStateProvider>
        </ThemeProvider>
      </ConfigProvider>
    </TolgeeProvider>
  )
}
