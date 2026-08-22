import { useEffect } from "preact/hooks";
import { WithConfig, WithTranslation } from "ui-ui-color-palette/ui/components";
import { ManagePalette } from "ui-ui-color-palette/ui/services";
import { useAppState } from "../data/AppStateContext";
import { resolvePaletteFromUrl } from "../data/urlPalette";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedManagePalette = WithConfig(
  WithTranslation(ManagePalette as any) as any,
) as any;

export default function ManagePage() {
  const { state } = useAppState();
  useEffect(() => {
    if (!window.location.search) return;

    resolvePaletteFromUrl(window.location.search)
      .then(() => {
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch((error) => console.error("[manage] Deep link failed:", error));
  }, []);

  return <WrappedManagePalette {...state} appData={state} />;
}
