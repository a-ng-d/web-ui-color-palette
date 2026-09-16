import { initMistral } from 'ui-ui-color-palette/external/mistral'
import { initSupabase } from 'ui-ui-color-palette/external/auth'
import webConfig from './webConfig'

let isInitialised = false

export const initExternals = (): void => {
  if (isInitialised) return
  isInitialised = true

  if (webConfig.env.isSupabaseEnabled) {
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY as
      | string
      | undefined

    if (webConfig.urls.databaseUrl && anonKey)
      initSupabase(webConfig.urls.databaseUrl, anonKey)
    else
      console.warn(
        '[externals] Supabase is enabled but VITE_SUPABASE_URL or ' +
          'VITE_SUPABASE_PUBLIC_ANON_KEY is missing — auth will be unavailable.'
      )
  }

  if (webConfig.env.isMistralAiEnabled) {
    const mistralApiKey = import.meta.env.VITE_MISTRAL_AI_API_KEY as
      | string
      | undefined

    if (mistralApiKey) initMistral(mistralApiKey)
    else
      console.warn(
        '[externals] Mistral AI is enabled but VITE_MISTRAL_AI_API_KEY is ' +
          'missing — GenAI palette generation will be unavailable.'
      )
  }
}
