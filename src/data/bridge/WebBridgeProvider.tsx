import { useEffect } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { useTolgee } from "@tolgee/react";
import type { UserTheme } from "ui-ui-color-palette/types";
import { $userTheme } from "ui-ui-color-palette/stores";
import { initDb } from "./db";
import { startBridge } from "./loadBridge";
import { setT } from "./context";

const USER_THEME_VALUES: UserTheme[] = ["light", "dark", "system"];

interface WebBridgeProviderProps {
  children: ComponentChildren;
}
export function WebBridgeProvider({ children }: WebBridgeProviderProps) {
  const tolgee = useTolgee();

  useEffect(() => {
    setT((key, params) => tolgee.t(key, params as Record<string, string>));

    const storedUserTheme = window.localStorage.getItem("user_theme");
    if (USER_THEME_VALUES.includes(storedUserTheme as UserTheme))
      $userTheme.set(storedUserTheme as UserTheme);

    initDb()
      .then(() => startBridge())
      .catch((err) =>
        console.error("[WebBridgeProvider] Failed to initialise bridge:", err),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
