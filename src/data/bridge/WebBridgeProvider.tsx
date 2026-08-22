import { useEffect } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { useTolgee } from "@tolgee/react";
import { initDb } from "./db";
import { startBridge } from "./loadBridge";
import { setT } from "./context";

interface WebBridgeProviderProps {
  children: ComponentChildren;
}
export function WebBridgeProvider({ children }: WebBridgeProviderProps) {
  const tolgee = useTolgee();

  useEffect(() => {
    setT((key, params) => tolgee.t(key, params as Record<string, string>));

    initDb()
      .then(() => startBridge())
      .catch((err) =>
        console.error("[WebBridgeProvider] Failed to initialise bridge:", err),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
