import { createContext } from 'preact'
import { useContext, useState, useEffect } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import type { BaseProps, PlanStatus, Service, Editor } from 'ui-ui-color-palette/types'
import { getSupabase, fetchUserEntitlements } from 'ui-ui-color-palette/external/auth'

// Shared app-level state visible to all service pages
export type WebAppState = Pick<
  BaseProps,
  | 'userSession'
  | 'userIdentity'
  | 'userConsent'
  | 'planStatus'
  | 'trialStatus'
  | 'trialRemainingTime'
  | 'creditsCount'
  | 'creditsRenewalDate'
  | 'editor'
  | 'documentWidth'
  | 'service'
>

const defaultAppState: WebAppState = {
  service: 'MANAGE' as Service,
  userSession: {
    connectionStatus: 'UNCONNECTED',
    userId: '',
    userFullName: '',
    userAvatar: '',
  },
  userIdentity: {
    id: '',
    fullName: '',
    avatar: '',
  },
  userConsent: [],
  planStatus: 'UNPAID' as PlanStatus,
  trialStatus: 'UNUSED',
  trialRemainingTime: 72,
  creditsCount: 0,
  creditsRenewalDate: 0,
  editor: 'figma' as Editor, // TODO Palier 3 — add 'web' to Editor type
  documentWidth: typeof window !== 'undefined' ? window.innerWidth : 1280,
}

interface AppStateContextType {
  state: WebAppState
  setState: (partial: Partial<WebAppState>) => void
}

const AppStateContext = createContext<AppStateContextType>({
  state: defaultAppState,
  setState: () => {},
})

export function AppStateProvider({ children }: { children: ComponentChildren }) {
  const [state, setStateFull] = useState<WebAppState>(defaultAppState)

  const setState = (partial: Partial<WebAppState>) =>
    setStateFull((prev) => ({ ...prev, ...partial }))

  // Auth lifecycle — mirrors plugin's componentDidMount Supabase block (no canvas bridge)
  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    supabase.auth.onAuthStateChange((event, session) => {
      const actions: Record<string, () => void> = {
        SIGNED_IN: () => {
          const userId = session?.user.id ?? ''
          setState({
            userSession: {
              connectionStatus: 'CONNECTED',
              userId,
              userFullName:
                session?.user.user_metadata.full_name ?? 'Anonymous Palette Wizard',
              userAvatar:
                session?.user.user_metadata.avatar_url ??
                `https://www.gravatar.com/avatar/${userId}?d=identicon`,
            },
          })
          if (userId)
            fetchUserEntitlements(userId)
              .then((result) => {
                if (result?.planStatus)
                  setState({ planStatus: result.planStatus as PlanStatus })
              })
              .catch(console.error)
        },
        SIGNED_OUT: () => {
          setState({
            userSession: {
              connectionStatus: 'UNCONNECTED',
              userId: '',
              userFullName: '',
              userAvatar: '',
            },
            planStatus: 'UNPAID',
          })
        },
      }

      actions[event]?.()
    })
  }, [])

  return (
    <AppStateContext.Provider value={{ state, setState }}>
      {children}
    </AppStateContext.Provider>
  )
}

export const useAppState = () => useContext(AppStateContext)
