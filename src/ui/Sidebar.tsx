import { useLocation } from 'preact-iso'
import { Button } from '@unoff/ui'
import type { IconList } from '@unoff/ui'
import { WithConfig, WithTranslation } from "ui-ui-color-palette/ui/components";
import { Shortcuts } from "ui-ui-color-palette/ui/modules";
import { useAppState } from "../data/AppStateContext";

const NAV_ITEMS: Array<{ path: string; icon: IconList; label: string }> = [
  { path: '/manage',  icon: 'colors',    label: 'Manage'   },
  { path: '/gen',     icon: 'ai',        label: 'Generate' },
  { path: '/extract', icon: 'image',     label: 'Extract'  },
  { path: '/wheel',   icon: 'list-tile', label: 'Wheel'    },
  { path: '/explore', icon: 'explore',   label: 'Explore'  },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedShortcuts = WithConfig(
  WithTranslation(Shortcuts as any) as any,
) as any
const noop = () => undefined

export function Sidebar() {
  const { path, route } = useLocation()
  const { state, signIn, signOut } = useAppState();

  return (
    <nav class="web-sidebar" aria-label="Services">
      <div class="web-sidebar__nav">
        {NAV_ITEMS.map(({ path: href, icon, label }) => {
          const isActive =
            path === href || (href === "/manage" && path === "/");

          return (
            <Button
              key={href}
              type="icon"
              icon={icon}
              state={isActive ? "selected" : "default"}
              helper={{ label }}
              action={() => route(href)}
            />
          );
        })}
      </div>
      <div class="web-sidebar__shortcuts">
        <WrappedShortcuts
          {...state}
          isAccountSubscribed={false}
          announcements={{ version: "", status: "NO_ANNOUNCEMENTS" }}
          orientation="VERTICAL"
          onSignIn={() => signIn("google")}
          onSignOut={signOut}
          onReOpenAnnouncements={noop}
          onReOpenOnboarding={noop}
          onReOpenStore={noop}
          onReOpenAbout={noop}
          onReOpenReport={noop}
          onReOpenPreferences={noop}
          onReOpenLicense={noop}
          onReOpenChat={noop}
          onReOpenFeedback={noop}
          onUpdateConsent={noop}
          onUpdateLanguage={noop}
        />
      </div>
    </nav>
  );
}
