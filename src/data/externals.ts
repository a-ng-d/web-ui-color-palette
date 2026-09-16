import { initPolar } from 'ui-ui-color-palette/external/transactional'
import {
  initMixpanel,
  setEditor,
  setMixpanelEnv,
} from 'ui-ui-color-palette/external/tracking'
import { initSentry } from 'ui-ui-color-palette/external/monitoring'
import { initMistral } from 'ui-ui-color-palette/external/mistral'
import { initNotion } from 'ui-ui-color-palette/external/cms'
import { initSupabase } from 'ui-ui-color-palette/external/auth'
import mixpanel from 'mixpanel-browser'
import * as Sentry from '@sentry/react'
import webConfig from './webConfig'

let isInitialised = false

export const initExternals = (): void => {
  if (isInitialised) return
  isInitialised = true

  if (webConfig.env.isMixpanelEnabled) {
    const mixpanelUrl = import.meta.env.VITE_MIXPANEL_URL as
      | string
      | undefined
    const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN as
      | string
      | undefined

    if (mixpanelToken) {
      mixpanel.init(mixpanelToken, {
        api_host: mixpanelUrl,
        debug: webConfig.env.isDev,
        disable_persistence: true,
        disable_cookie: true,
        ignore_dnt: true,
        opt_out_tracking_by_default: true,
        record_sessions_percent: webConfig.env.isDev ? 0 : 50,
        record_mask_text_selector: '*',
        record_block_selector: 'img',
        record_heatmap_data: true,
      })
      mixpanel.opt_in_tracking()

      const now = new Date()
      const cohort = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const env = import.meta.env.MODE as 'development' | 'production'
      mixpanel.register({
        Cohort: cohort,
        Version: webConfig.versions.pluginVersion,
        Env: env,
      })

      initMixpanel(mixpanel)
      setMixpanelEnv(env)
      setEditor(webConfig.env.editor)
    } else
      console.warn(
        '[externals] Mixpanel is enabled but VITE_MIXPANEL_TOKEN is ' +
          'missing — tracking will be unavailable.'
      )
  }

  if (webConfig.env.isSentryEnabled && !webConfig.env.isDev) {
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined

    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        environment: 'production',
        initialScope: {
          tags: {
            platform: webConfig.env.platform,
            version: webConfig.versions.pluginVersion,
          },
        },
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
          Sentry.feedbackIntegration({
            colorScheme: 'system',
            autoInject: false,
          }),
        ],
        attachStacktrace: true,
        normalizeDepth: 15,
        maxValueLength: 5000,
        maxBreadcrumbs: 150,
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.01,
        replaysOnErrorSampleRate: 1.0,
        release: webConfig.versions.pluginVersion,
      })

      initSentry(Sentry)
    } else
      console.warn(
        '[externals] Sentry is enabled but VITE_SENTRY_DSN is missing — ' +
          'error monitoring will be unavailable.'
      )
  }

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

  if (webConfig.env.isNotionEnabled) {
    const notionApiKey = import.meta.env.VITE_NOTION_API_KEY as
      | string
      | undefined

    if (notionApiKey) initNotion(notionApiKey)
    else
      console.warn(
        '[externals] Notion is enabled but VITE_NOTION_API_KEY is missing ' +
          '— announcements/onboarding content will be unavailable.'
      )
  }

  if (webConfig.env.isPolarEnabled && webConfig.env.isSupabaseEnabled) {
    const polarAccessToken = import.meta.env.VITE_POLAR_ACCESS_TOKEN as
      | string
      | undefined

    if (polarAccessToken && webConfig.urls.databaseUrl)
      initPolar(
        polarAccessToken,
        `${webConfig.urls.databaseUrl}/functions/v1`,
        webConfig.env.isDev ? 'sandbox' : 'production'
      )
    else
      console.warn(
        '[externals] Polar is enabled but VITE_POLAR_ACCESS_TOKEN or ' +
          'VITE_SUPABASE_URL is missing — checkout will be unavailable.'
      )
  }
}
