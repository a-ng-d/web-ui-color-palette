export const dispatch = (type: string, data?: unknown): void => {
  window.dispatchEvent(
    new CustomEvent("platformMessage", {
      detail: data !== undefined ? { type, data } : { type },
    }),
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
