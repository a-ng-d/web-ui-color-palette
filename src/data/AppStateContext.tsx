import { createContext } from 'preact'
import { useContext, useRef, useState, useEffect } from 'preact/hooks'
import type { ComponentChildren, RefObject } from 'preact'
import type {
  AnnouncementsDigest,
  BaseProps,
  LicenseTrigger,
  ModalContext,
  NotificationMessage,
  PlanStatus,
  Service,
  Editor,
} from 'ui-ui-color-palette/types'
import type { ManagePalette } from 'ui-ui-color-palette/ui/services'
import { getSupabase, fetchUserEntitlements } from 'ui-ui-color-palette/external/auth'
import { restoreSession, signInWithOAuth, signOutWeb } from "./webAuth";

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
  modalContext: ModalContext
  announcements: AnnouncementsDigest
  notification: NotificationMessage
  licenseTrigger: LicenseTrigger
  pricingOrigin: string
}

const defaultAppState: WebAppState = {
  service: "MANAGE" as Service,
  userSession: {
    connectionStatus: "UNCONNECTED",
    userId: "",
    userFullName: "",
    userAvatar: "",
  },
  userIdentity: {
    id: "",
    fullName: "",
    avatar: "",
  },
  userConsent: [],
  planStatus: "UNPAID" as PlanStatus,
  trialStatus: "UNUSED",
  trialRemainingTime: 72,
  creditsCount: 0,
  creditsRenewalDate: 0,
  editor: "web" as Editor,
  documentWidth: typeof window !== "undefined" ? window.innerWidth : 1280,
  modalContext: "EMPTY",
  announcements: {
    version: "",
    status: "NO_ANNOUNCEMENTS",
  },
  notification: {
    type: "INFO",
    message: "",
    timer: 5000,
  },
  licenseTrigger: { type: "ACTIVATE" },
  pricingOrigin: "UNKNOWN",
};

interface AppStateContextType {
  state: WebAppState;
  setState: (partial: Partial<WebAppState>) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  managePaletteRef: RefObject<ManagePalette>;
}

const AppStateContext = createContext<AppStateContextType>({
  state: defaultAppState,
  setState: () => {},
  signIn: async () => {},
  signOut: async () => {},
  managePaletteRef: { current: null },
});

export function AppStateProvider({ children }: { children: ComponentChildren }) {
  const [state, setStateFull] = useState<WebAppState>(defaultAppState)
  const managePaletteRef = useRef<ManagePalette>(null)

  const setState = (partial: Partial<WebAppState>) =>
    setStateFull((prev) => ({ ...prev, ...partial }))

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    const applySession = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session: any,
    ) => {
      const userId = session?.user.id ?? "";
      setState({
        userSession: {
          connectionStatus: "CONNECTED",
          userId,
          userFullName:
            session?.user.user_metadata.full_name ?? "Anonymous Palette Wizard",
          userAvatar:
            session?.user.user_metadata.avatar_url ??
            `https://www.gravatar.com/avatar/${userId}?d=identicon`,
        },
        userIdentity: {
          id: userId,
          fullName: session?.user.user_metadata.full_name ?? "",
          avatar: session?.user.user_metadata.avatar_url ?? "",
        },
      });
      if (userId)
        fetchUserEntitlements(userId)
          .then((result) => {
            if (result?.planStatus)
              setState({ planStatus: result.planStatus as PlanStatus });
          })
          .catch(console.error);
    };

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const actions: Record<string, () => void> = {
          SIGNED_IN: () => applySession(session),
          TOKEN_REFRESHED: () => applySession(session),
          SIGNED_OUT: () => {
            setState({
              userSession: {
                connectionStatus: "UNCONNECTED",
                userId: "",
                userFullName: "",
                userAvatar: "",
              },
              userIdentity: { id: "", fullName: "", avatar: "" },
              planStatus: "UNPAID",
            });
          },
        };

        actions[event]?.();
      },
    );

    restoreSession().then((session) => {
      if (session) applySession(session);
    });

    return () => subscription?.subscription?.unsubscribe();
  }, [])

  const signIn = async () => signInWithOAuth();

  const signOut = async () => signOutWeb();

  return (
    <AppStateContext.Provider
      value={{ state, setState, signIn, signOut, managePaletteRef }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext)
