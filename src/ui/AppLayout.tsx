import { useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import type { ComponentChildren } from "preact";
import type { Service } from "ui-ui-color-palette/types";
import "ui-ui-color-palette/ui/stylesheets/app.css";
import "./web-layout.css";
import { Sidebar } from "./Sidebar";
import { NotificationHost } from "./NotificationHost";
import { ModalHost } from "./ModalHost";
import { useAppState } from "../data/AppStateContext";

interface AppLayoutProps {
  children?: ComponentChildren;
}

const SERVICE_BY_PATH: Record<string, Service> = {
  "/": "MANAGE",
  "/manage": "MANAGE",
  "/gen": "GEN",
  "/extract": "EXTRACT",
  "/wheel": "WHEEL",
  "/explore": "EXPLORE",
};

function useServiceSync() {
  const { path } = useLocation();
  const { setState } = useAppState();

  useEffect(() => {
    setState({ service: SERVICE_BY_PATH[path] ?? "MANAGE" });
  }, [path]);
}

export function AppLayout({ children }: AppLayoutProps) {
  useServiceSync();
  const { state } = useAppState();

  return (
    <div id="app" class="web-app">
      <Sidebar />
      <main inert={state.modalContext !== "EMPTY"}>{children}</main>
      <NotificationHost />
      <ModalHost />
    </div>
  );
}
