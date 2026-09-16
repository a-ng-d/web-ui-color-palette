import { prerender } from 'preact-iso'
import { App } from './App'

export async function render(url: string) {
  const parsed = new URL(url);

  Object.defineProperty(globalThis, "location", {
    value: parsed,
    configurable: true,
    writable: true,
  });

  return await prerender(<App url={parsed.pathname + parsed.search} />);
}
