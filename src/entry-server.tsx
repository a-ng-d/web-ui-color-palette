import { prerender } from 'preact-iso'
import { App } from './App'

export async function render() {
  return await prerender(<App />)
}
