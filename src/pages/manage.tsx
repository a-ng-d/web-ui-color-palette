import { useEffect, useRef, useState } from "preact/hooks";
import { useTranslate } from "@tolgee/react";
import { SemanticMessage } from "@unoff/ui";
import { WithConfig, WithTranslation } from "ui-ui-color-palette/ui/components";
import { ManagePalette } from "ui-ui-color-palette/ui/services";
import { useAppState } from "../data/AppStateContext";
import { resolvePaletteFromUrl } from "../data/urlPalette";
import { useSyncPaletteUrl } from "../ui/useSyncPaletteUrl";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedManagePalette = WithConfig(
  WithTranslation(ManagePalette as any) as any,
) as any;

export default function ManagePage() {
  const { state } = useAppState();
  const currentUserId = state.userSession.userId;
  const { t } = useTranslate();

  const [isAccessDenied, setIsAccessDenied] = useState(false);

  const lastResolvedSearch = useRef<string | null>(null);

  useEffect(() => {
    const search = window.location.search;
    if (!search) return;
    if (search === lastResolvedSearch.current) return;

    resolvePaletteFromUrl(search, currentUserId)
      .then((result) => {
        if (result !== "blocked") lastResolvedSearch.current = search;
        setIsAccessDenied(result === "blocked");
      })
      .catch((error) => console.error("[manage] Deep link failed:", error));
  }, [currentUserId]);

  useSyncPaletteUrl();
  return (
    <div className="web-manage-page">
      {isAccessDenied && (
        <div className="web-access-denied">
          <SemanticMessage
            type="WARNING"
            message={t("error.paletteAccessDenied")}
          />
        </div>
      )}
      <WrappedManagePalette {...state} appData={state} />
    </div>
  );
}
