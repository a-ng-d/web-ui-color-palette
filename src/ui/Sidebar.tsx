import { useLocation } from "preact-iso";
import { Button, Tabs } from "@unoff/ui";
import type { IconList } from "@unoff/ui";
import { WithConfig, WithTranslation } from "ui-ui-color-palette/ui/components";
import { Shortcuts } from "ui-ui-color-palette/ui/modules";
import { useAppState } from "../data/AppStateContext";
import { useCompactLayout } from "./useCompactLayout";

const NAV_ITEMS: Array<{ path: string; icon: IconList; label: string }> = [
  { path: "/manage", icon: "colors", label: "Manage" },
  { path: "/gen", icon: "ai", label: "Generate" },
  { path: "/extract", icon: "image", label: "Extract" },
  { path: "/wheel", icon: "list-tile", label: "Wheel" },
  { path: "/explore", icon: "explore", label: "Explore" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedShortcuts = WithConfig(
  WithTranslation(Shortcuts as any) as any,
) as any;

export function Sidebar() {
  const { path, route } = useLocation();
  const { state, setState, signIn, signOut, managePaletteRef } =
    useAppState();
  const isCompact = useCompactLayout();

  const activeTab = path === "/" ? "/manage" : path;

  return (
    <nav class="web-sidebar" aria-label="Services">
      <div class="web-sidebar__nav">
        {isCompact ? (
          NAV_ITEMS.map(({ path: href, icon, label }) => (
            <Button
              key={href}
              type="icon"
              icon={icon}
              state={href === activeTab ? "selected" : "default"}
              helper={{ label }}
              action={() => route(href)}
            />
          ))
        ) : (
          <Tabs
            direction="VERTICAL"
            active={activeTab}
            tabs={NAV_ITEMS.map(({ path: href, icon, label }) => ({
              id: href,
              label,
              icon: { type: "PICTO", name: icon },
              isUpdated: false,
            }))}
            action={(event: Event) => {
              const href = (event.currentTarget as HTMLElement | null)?.dataset
                .feature;
              if (href) route(href);
            }}
          />
        )}
      </div>
      <div class="web-sidebar__shortcuts">
        <WrappedShortcuts
          {...state}
          isAccountSubscribed={false}
          announcements={{ version: "", status: "NO_ANNOUNCEMENTS" }}
          orientation="VERTICAL"
          onSignIn={signIn}
          onSignOut={signOut}
          onReOpenAnnouncements={setState}
          onReOpenOnboarding={() => managePaletteRef.current?.onStartTour()}
          onReOpenStore={setState}
          onReOpenAbout={setState}
          onReOpenReport={setState}
          onReOpenPreferences={setState}
          onReOpenLicense={setState}
          onReOpenChat={setState}
          onReOpenFeedback={setState}
          onUpdateConsent={setState}
          onUpdateLanguage={setState}
        />
      </div>
    </nav>
  );
}
