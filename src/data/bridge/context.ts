if (typeof window !== "undefined")
  window.addEventListener("message", (event: MessageEvent) => {
    if (event.source !== window) return;
    window.dispatchEvent(
      new CustomEvent("platformMessage", { detail: event.data }),
    );
  });

export const dispatch = (type: string, data?: unknown): void => {
  window.postMessage(
    data !== undefined ? { type, data } : { type },
    window.location.origin,
  );
};

export const navigate = (path: string): void => {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

type TFn = (key: string, params?: Record<string, unknown>) => string;

let _t: TFn = (key) => key;

export const setT = (fn: TFn): void => {
  _t = fn;
};

export const t = (key: string, params?: Record<string, unknown>): string =>
  _t(key, params);
