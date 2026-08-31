import { useEffect, useState } from "preact/hooks";
import { createPortal } from "preact/compat";
import { Notification } from "@unoff/ui";

type NotificationTone = "NEUTRAL" | "INFO" | "SUCCESS" | "WARNING" | "ERROR";

interface NotificationState {
  type: NotificationTone;
  message: string;
  timer?: number;
}

export function NotificationHost() {
  const [notification, setNotification] = useState<NotificationState | null>(
    null,
  );

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      if (event.detail?.type !== "POST_MESSAGE") return;

      const data = event.detail.data as
        | { type: NotificationTone; message: string; timer?: number }
        | undefined;
      if (!data?.message) return;

      setNotification({
        type: data.type,
        message: data.message,
        timer: data.timer === undefined ? 5000 : data.timer,
      });
    };

    window.addEventListener("platformMessage", handler as EventListener);
    return () =>
      window.removeEventListener("platformMessage", handler as EventListener);
  }, []);

  const target = document.getElementById("toast");
  if (!notification || !target) return null;

  return createPortal(
    <Notification
      type={notification.type}
      message={notification.message}
      timer={notification.timer}
      onClose={() => setNotification(null)}
    />,
    target,
  );
}
