/**
 * Web platform configuration.
 * Mirrors the structure of ui-ui-color-palette/src/global.config.ts
 * for the 'web' platform (no __PLATFORM__ define required at runtime).
 *
 * TODO Palier 3: add 'web' to Platform and Editor union types in the plugin.
 */
import type { Config } from 'ui-ui-color-palette/types'

const webConfig: Config = {
  limits: {
    pageSize: 0,
    width: 500,
    height: 600,
    minWidth: 280,
    minHeight: 400,
    sourceColors: 5,
    customStops: 8,
  },
  env: {
    platform: 'figma' as const, // TODO Palier 3 — add 'web' to Platform union
    editor: 'figma' as const,   // TODO Palier 3 — add 'web' to Editor union
    ui: 'figma' as const,
    colorMode: 'figma-light' as const,
    isDev: import.meta.env.DEV,
    isMixpanelEnabled: import.meta.env.VITE_MIXPANEL_ENABLED === 'true',
    isSentryEnabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
    isSupabaseEnabled: import.meta.env.VITE_SUPABASE_ENABLED === 'true',
    isMistralAiEnabled: import.meta.env.VITE_MISTRAL_AI_ENABLED === 'true',
    isNotionEnabled: import.meta.env.VITE_NOTION_ENABLED === 'true',
    isPolarEnabled: import.meta.env.VITE_POLAR_ENABLED === 'true',
    announcementsDbId: import.meta.env.VITE_NOTION_ANNOUNCEMENTS_ID ?? '',
    onboardingDbId: import.meta.env.VITE_NOTION_ONBOARDING_ID ?? '',
    pluginId: '',
  },
  plan: {
    isProEnabled: import.meta.env.VITE_PRO_ENABLED === 'true',
    isTrialEnabled: import.meta.env.VITE_TRIAL_ENABLED === 'true',
    isCreditsEnabled: import.meta.env.VITE_CREDITS_ENABLED === 'true',
    trialTime: 72,
    creditsLimit: 50,
    creditsRenewalPeriodDays: 30,
  },
  dbs: {
    palettesDbViewName: import.meta.env.VITE_DBS_PALETTES_VIEW ?? '',
    palettesDbTableName: import.meta.env.VITE_DBS_PALETTES_TABLE ?? '',
    starredPalettesDbTableName: import.meta.env.VITE_DBS_STARRED_PALETTES_TABLE ?? '',
  },
  urls: {
    databaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
    authWorkerUrl: import.meta.env.VITE_AUTH_WORKER_URL ?? '',
    announcementsWorkerUrl: import.meta.env.VITE_ANNOUNCEMENTS_WORKER_URL ?? '',
    corsWorkerUrl: import.meta.env.VITE_CORS_WORKER_URL ?? '',
    storeApiUrl: import.meta.env.VITE_LEMONSQUEEZY_URL ?? '',
    uiUrl: import.meta.env.VITE_UI_URL ?? '',
    authUrl: import.meta.env.VITE_AUTH_URL ?? '',
    platformUrl: '*',
    documentationUrl: '',
    repositoryUrl: '',
    supportEmail: '',
    communityUrl: '',
    feedbackUrl: '',
    trialFeedbackUrl: '',
    requestsUrl: '',
    networkUrl: '',
    authorUrl: '',
    licenseUrl: '',
    privacyUrl: '',
    vsCodeFigmaPluginUrl: '',
    isbUrl: '',
    uicpUrl: '',
    storeManagementUrl: '',
    storeProWeekUrl: '',
    storeProMonthUrl: '',
    storeProYearUrl: '',
    storeProLifetimeUrl: '',
    storeUltimateRequestUrl: '',
    howToUseUrl: '',
  },
  versions: {
    userConsentVersion: '2024.01',
    trialVersion: '2024.04',
    algorithmVersion: 'v3',
    paletteVersion: '2025.06',
    pluginVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
    creditsVersion: '2026.05',
  },
  // Web platform: no canvas sync features. Populated in Palier 3 with doSpecificMode().
  features: [],
  lang: (typeof navigator !== 'undefined'
    ? (navigator.language?.split('-')[0] as Config['lang'])
    : 'en-US') ?? 'en-US',
  fees: {
    colourLoversImport: 25,
    coolorsImport: 25,
    realtimeColorsImport: 25,
    imageColorsExtract: 50,
    harmonyCreate: 50,
    aiColorsGenerate: 50,
    paletteCreate: 100,
    paletteGenerate: 200,
    paletteWithPropsGenerate: 200,
    sheetGenerate: 200,
    paletteUpdates: 100,
    localStylesSync: 300,
    localVariablesSync: 300,
    localTokensSync: 300,
  },
}

export default webConfig
