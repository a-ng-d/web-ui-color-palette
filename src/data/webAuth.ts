import {
  getSupabase,
  signIn as legacySignIn,
  signOut as legacySignOut,
} from 'ui-ui-color-palette/external/auth'
import webConfig from './webConfig'

const authParams = () => ({
  authWorkerUrl: webConfig.urls.authWorkerUrl,
  authUrl: webConfig.urls.authUrl,
  platformUrl: webConfig.urls.platformUrl,
  pluginId: webConfig.env.pluginId,
})

export const signInWithOAuth = async (): Promise<void> => {
  await legacySignIn(authParams())
}

export const signOutWeb = async (): Promise<void> => {
  await legacySignOut(authParams())
}

export const restoreSession = async () => {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('[webAuth] Failed to restore session:', error)
    return null
  }
  return data.session
}
