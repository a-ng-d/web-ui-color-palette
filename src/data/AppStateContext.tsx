import type { ConsentConfiguration } from '@unoff/ui'
import {
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'preact/hooks'
import { createContext } from 'preact'
import isValidPaletteConfiguration from '@ui-lib/utils/isValidPaletteConfiguration'
import {
  $canStylesDeepSync,
  $canTokensDeepSync,
  $canVariablesDeepSync,
  $creditsCount,
  $isAPCADisplayed,
  $isAPCAIntervalDisplayed,
  $isSuggestedLanguageDisplayed,
  $isWCAGDisplayed,
  $isWCAGIntervalDisplayed,
  $localPalettesCount,
  $palettesView,
  $userTheme,
  updateUserConsentWithData,
} from '@ui-lib/stores'
import { validateUserLicenseKey } from '@ui-lib/external/license'
import { checkAnnouncementsVersion } from '@ui-lib/external/cms'
import {
  getSupabase,
  fetchUserEntitlements,
} from '@ui-lib/external/auth'
import { useTolgee } from '@tolgee/react'
import webConfig from './webConfig'
import { restoreSession, signInWithOAuth, signOutWeb } from './webAuth'
import type { ComponentChildren, RefObject } from 'preact'
import type { ManagePalette } from '@ui-lib/ui/services'
import type {
  AnnouncementsDigest,
  BaseProps,
  Language,
  LicenseTrigger,
  ModalContext,
  NotificationMessage,
  PlanStatus,
  Service,
  Editor,
  PalettesView,
  UserTheme,
} from '@ui-lib/types'

const LANGUAGE_MAPPING: Partial<Record<string, Language>> = {
  'en-US': 'en-US',
  en: 'en-US',
  'pt-BR': 'pt-BR',
  pt: 'pt-BR',
  'fr-FR': 'fr-FR',
  fr: 'fr-FR',
  'zh-Hans-CN': 'zh-Hans-CN',
  zh: 'zh-Hans-CN',
  'es-ES': 'es-ES',
  es: 'es-ES',
  'ja-JP': 'ja-JP',
  ja: 'ja-JP',
  'ko-KR': 'ko-KR',
  ko: 'ko-KR',
}

const detectSuggestedLanguage = (userLanguage: Language): Language | null => {
  const browserLang = navigator.language
  const suggested =
    LANGUAGE_MAPPING[browserLang] ?? LANGUAGE_MAPPING[browserLang.split('-')[0]]

  return suggested && suggested !== userLanguage ? suggested : null
}

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
> & {
  isAccountSubscribed: boolean
  modalContext: ModalContext
  mustUserConsent: boolean
  announcements: AnnouncementsDigest
  notification: NotificationMessage
  licenseTrigger: LicenseTrigger
  pricingOrigin: string
  localPalettesCount: number
  suggestedLanguage: Language | null
  isLoaded: boolean
}

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
  editor: 'web' as Editor,
  documentWidth:
    typeof document !== 'undefined'
      ? document.documentElement.clientWidth
      : 1280,
  modalContext: 'EMPTY',
  mustUserConsent: false,
  announcements: {
    version: '',
    status: 'NO_ANNOUNCEMENTS',
  },
  notification: {
    type: 'INFO',
    message: '',
    timer: 5000,
  },
  licenseTrigger: { type: 'ACTIVATE' },
  pricingOrigin: 'UNKNOWN',
  localPalettesCount: 0,
  isAccountSubscribed: false,
  suggestedLanguage: null,
  isLoaded: false,
}

interface AppStateContextType {
  state: WebAppState
  setState: (partial: Partial<WebAppState>) => void
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  managePaletteRef: RefObject<ManagePalette>
}

/* eslint-disable @typescript-eslint/no-empty-function -- placeholder default, replaced by AppStateProvider's real implementation */
const AppStateContext = createContext<AppStateContextType>({
  state: defaultAppState,
  setState: () => {},
  signIn: async () => {},
  signOut: async () => {},
  managePaletteRef: { current: null },
})
/* eslint-enable @typescript-eslint/no-empty-function */

export function AppStateProvider({
  children,
}: {
  children: ComponentChildren
}) {
  const [state, setStateFull] = useState<WebAppState>(defaultAppState)
  const managePaletteRef = useRef<ManagePalette>(null)
  const tolgee = useTolgee()

  const setState = useCallback(
    (partial: Partial<WebAppState>) =>
      setStateFull((prev) => ({ ...prev, ...partial })),
    []
  )

  useEffect(() => {
    const handleResize = () =>
      setState({ documentWidth: document.documentElement.clientWidth })

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setState])

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      const { type, data } = event.detail ?? {}

      const actions: Record<string, () => void> = {
        CHECK_USER_PREFERENCES: () => {
          $isWCAGDisplayed.set(data.isWCAGDisplayed)
          $isAPCADisplayed.set(data.isAPCADisplayed)
          $isWCAGIntervalDisplayed.set(data.isWCAGIntervalDisplayed)
          $isAPCAIntervalDisplayed.set(data.isAPCAIntervalDisplayed)
          $canStylesDeepSync.set(data.canDeepSyncStyles)
          $canVariablesDeepSync.set(data.canDeepSyncVariables)
          $canTokensDeepSync.set(data.canDeepSyncTokens)
          $isSuggestedLanguageDisplayed.set(data.isSuggestedLanguageDisplayed)
          $userTheme.set((data.userTheme ?? 'system') as UserTheme)
          $palettesView.set((data.palettesView ?? 'MOSAIC') as PalettesView)

          setState({
            suggestedLanguage: detectSuggestedLanguage(data.userLanguage),
          })

          setTimeout(() => setState({ isLoaded: true }), 2000)

          tolgee.changeLanguage(data.userLanguage).then(() => {
            document.documentElement.setAttribute(
              'lang',
              data.userLanguage ?? tolgee.getLanguage()
            )
          })
        },
        CHECK_USER_CONSENT: () => {
          const userConsent = data.userConsent as Array<ConsentConfiguration>
          updateUserConsentWithData(tolgee.t, userConsent)
          setState({
            userConsent,
            mustUserConsent: Boolean(data.mustUserConsent),
          })
        },
        CHECK_CREDITS: () => {
          $creditsCount.set(data.creditsCount)
          setState({
            creditsCount: data.creditsCount,
            creditsRenewalDate: data.creditsRenewalDate,
          })
        },
        CHECK_TRIAL_STATUS: () => {
          setStateFull((prev) => ({
            ...prev,
            planStatus: data.planStatus === 'PAID' ? 'PAID' : prev.planStatus,
            trialStatus: data.trialStatus,
            trialRemainingTime: data.trialRemainingTime,
          }))
        },
        EXPOSE_PALETTES: () => {
          const count = Array.isArray(data)
            ? (data as Array<unknown>).filter(isValidPaletteConfiguration)
                .length
            : 0
          $localPalettesCount.set(count)
          setState({ localPalettesCount: count })
        },
        CHECK_USER_LICENSE: () => {
          validateUserLicenseKey({
            corsWorkerUrl: webConfig.urls.corsWorkerUrl,
            storeApiUrl: webConfig.urls.storeApiUrl,
            licenseKey: data.licenseKey,
            instanceId: data.instanceId,
          })
            .then((isValid: boolean) => {
              if (!isValid) return
              setStateFull((prev) => ({
                ...prev,
                planStatus: 'PAID',
                trialStatus:
                  prev.trialStatus !== 'UNUSED'
                    ? 'SUSPENDED'
                    : prev.trialStatus,
              }))
            })
            .catch(console.error)
        },
        GET_TRIAL: () => {
          setState({ modalContext: 'TRY' })
        },
        ENABLE_TRIAL: () => {
          setState({
            planStatus: 'PAID',
            trialStatus: 'PENDING',
            modalContext: 'WELCOME_TO_TRIAL',
          })
        },
        GET_PRICING: () => {
          setState({
            modalContext: 'PRICING',
            licenseTrigger: data.licenseTrigger,
            pricingOrigin: data.origin ?? 'UNKNOWN',
          })
        },
        GET_LICENSE: () => {
          setState({ modalContext: 'LICENSE' })
        },
        ENABLE_PRO_PLAN: () => {
          setState({ planStatus: 'PAID' })
        },
        LEAVE_PRO_PLAN: () => {
          setState({ planStatus: 'UNPAID' })
        },
        WELCOME_TO_PRO: () => {
          setStateFull((prev) => ({
            ...prev,
            planStatus: 'PAID',
            modalContext: 'WELCOME_TO_PRO',
            trialStatus:
              prev.trialStatus !== 'UNUSED' ? 'SUSPENDED' : prev.trialStatus,
          }))
        },
        CHECK_ANNOUNCEMENTS_VERSION: () => {
          checkAnnouncementsVersion(
            webConfig.urls.announcementsWorkerUrl,
            webConfig.env.announcementsDbId
          )
            .then((version: string) => {
              setStateFull((prev) => ({
                ...prev,
                announcements: { version, status: 'NO_ANNOUNCEMENTS' },
              }))

              window.dispatchEvent(
                new CustomEvent('pluginMessage', {
                  detail: {
                    message: {
                      pluginMessage: {
                        type: 'CHECK_ANNOUNCEMENTS_STATUS',
                        data: { version },
                      },
                    },
                    targetOrigin: '*',
                  },
                })
              )
            })
            .catch(console.error)
        },
        PUSH_ANNOUNCEMENTS_STATUS: () => {
          setStateFull((prev) => ({
            ...prev,
            modalContext:
              data.status === 'DISPLAY_ANNOUNCEMENTS_DIALOG'
                ? 'ANNOUNCEMENTS'
                : 'EMPTY',
            announcements: {
              version: prev.announcements.version,
              status: data.status,
            },
          }))
        },
      }

      actions[type]?.()
    }

    window.addEventListener('platformMessage', handler as EventListener)
    return () =>
      window.removeEventListener('platformMessage', handler as EventListener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    const applySession = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session: any
    ) => {
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
        userIdentity: {
          id: userId,
          fullName: session?.user.user_metadata.full_name ?? '',
          avatar: session?.user.user_metadata.avatar_url ?? '',
        },
      })
      if (userId)
        fetchUserEntitlements(userId)
          .then((result) => {
            if (result?.planStatus)
              setState({
                planStatus: result.planStatus as PlanStatus,
                isAccountSubscribed: result.planStatus === 'PAID',
              })
          })
          .catch(console.error)
    }

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const actions: Record<string, () => void> = {
          SIGNED_IN: () => applySession(session),
          TOKEN_REFRESHED: () => applySession(session),
          SIGNED_OUT: () => {
            setStateFull((prev) => ({
              ...prev,
              userSession: {
                connectionStatus: 'UNCONNECTED',
                userId: '',
                userFullName: '',
                userAvatar: '',
              },
              userIdentity: { id: '', fullName: '', avatar: '' },
              isAccountSubscribed: false,
              planStatus: prev.isAccountSubscribed ? 'UNPAID' : prev.planStatus,
            }))
          },
        }

        actions[event]?.()
      }
    )

    restoreSession().then((session) => {
      if (session) applySession(session)
    })

    return () => subscription?.subscription?.unsubscribe()
  }, [setState])

  const signIn = async () => signInWithOAuth()

  const signOut = async () => signOutWeb()

  return (
    <AppStateContext.Provider
      value={{ state, setState, signIn, signOut, managePaletteRef }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export const useAppState = () => useContext(AppStateContext)
