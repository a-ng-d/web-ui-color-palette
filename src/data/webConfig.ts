import { doSpecificMode } from '@ui-lib/stores'
import type { Config } from '@ui-lib/types'

const webInactiveFeatures = [
  'LOCAL_PALETTES_FILE',
  'IMPORTS_CANVAS',
  'DOCUMENT_CREATE',
  'DOCUMENT_PUSH_UPDATES',
  'DOCUMENT_PALETTE',
  'DOCUMENT_PALETTE_PROPERTIES',
  'DOCUMENT_SHEET',
  'SYNC_LOCAL_STYLES',
  'SYNC_LOCAL_VARIABLES',
  'SYNC_LOCAL_TOKENS',
  'USER_PREFERENCES_SYNC_DEEP_STYLES',
  'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
  'USER_PREFERENCES_SYNC_DEEP_TOKENS',
  'RESIZE_UI',
]

const webProFeatures = [
  'CREATE_PALETTE',
  'LOCAL_PALETTES',
  'PREVIEW_SCORES_WCAG_INTERVAL',
  'PREVIEW_SCORES_APCA_INTERVAL',
  'PREVIEW_FILTER_PASS',
  'PREVIEW_FILTER_FAIL',
  'PRESETS_MATERIAL',
  'PRESETS_MATERIAL_3',
  'PRESETS_TAILWIND',
  'PRESETS_ANT',
  'PRESETS_RADIX',
  'PRESETS_UNTITLED_UI',
  'PRESETS_BOOTSTRAP',
  'PRESETS_OPEN_COLOR',
  'PRESETS_SPECTRUM',
  'PRESETS_SPECTRUM_NEUTRAL',
  'PRESETS_ADS',
  'PRESETS_ADS_NEUTRAL',
  'PRESETS_CARBON',
  'PRESETS_BASE',
  'PRESETS_FLUENT',
  'PRESETS_POLARIS',
  'PRESETS_CUSTOM_ADD',
  'COLORS_ADD',
  'THEMES_ADD',
  'EXPORT_TOKENS_DTCG',
  'EXPORT_TOKENS_NATIVE',
  'EXPORT_TOKENS_STYLE_DICTIONARY_V3',
  'EXPORT_TOKENS_UNIVERSAL',
  'EXPORT_STYLESHEET_SCSS',
  'EXPORT_STYLESHEET_LESS',
  'EXPORT_TAILWIND_V3',
  'EXPORT_TAILWIND_V4',
  'EXPORT_APPLE_SWIFTUI',
  'EXPORT_APPLE_UIKIT',
  'EXPORT_ANDROID_COMPOSE',
  'EXPORT_ANDROID_XML',
  'EXPORT_CSV',
  'REPORT',
  'HELP_EMAIL',
]

const systemColorMode: 'yelbolt-uicp-light' | 'yelbolt-uicp-dark' =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'yelbolt-uicp-dark'
    : 'yelbolt-uicp-light'

const webConfig: Config = {
  limits: {
    pageSize: 20,
    width: 500,
    height: 600,
    minWidth: 280,
    minHeight: 400,
    sourceColors: 5,
    customStops: 8,
    colorThemes: 2,
  },
  env: {
    platform: 'yelbolt' as const,
    editor: 'web' as const,
    ui: 'yelbolt' as const,
    colorMode: systemColorMode,
    isDev: import.meta.env.DEV,
    isEmbed:
      typeof window !== 'undefined' &&
      ['1', 'true'].includes(
        (
          new URLSearchParams(window.location.search).get('embed') ?? ''
        ).toLowerCase()
      ),
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
    creditsRenewalPeriodHours: 720,
    storeProWeekId: '20d1df96-8052-47de-bf62-36b412c35885',
    storeProMonthId: '5f0502a5-9708-459d-b002-495e2860c23a',
    storeProYearId: '66a55061-29ff-4c52-8ce0-0661ab12890e',
    storeProLifetimeId: 'ae8ecdd5-badd-42d1-98fc-91f6ffdc77a6',
  },
  dbs: {
    palettesDbViewName: import.meta.env.VITE_DBS_PALETTES_VIEW ?? '',
    palettesDbTableName: import.meta.env.VITE_DBS_PALETTES_TABLE ?? '',
    starredPalettesDbTableName:
      import.meta.env.VITE_DBS_STARRED_PALETTES_TABLE ?? '',
  },
  urls: {
    databaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
    authWorkerUrl: import.meta.env.VITE_AUTH_WORKER_URL ?? '',
    announcementsWorkerUrl: import.meta.env.VITE_ANNOUNCEMENTS_WORKER_URL ?? '',
    corsWorkerUrl: import.meta.env.VITE_CORS_WORKER_URL ?? '',
    storeApiUrl: import.meta.env.VITE_LEMONSQUEEZY_URL ?? '',
    uiUrl: import.meta.env.VITE_UI_URL ?? '',
    authUrl: import.meta.env.VITE_AUTH_URL ?? '',
    platformUrl: typeof window !== 'undefined' ? window.location.origin : '*',
    documentationUrl: 'https://uicp.ylb.lt/docs',
    repositoryUrl: 'https://uicp.ylb.lt/repository',
    communityUrl: 'https://uicp.ylb.lt/community',
    supportEmail: 'https://uicp.ylb.lt/support',
    feedbackUrl:
      'https://angd.notion.site/ebd/13df8c62fd868018989de53f17ad6df3',
    trialFeedbackUrl: 'https://uicp.ylb.lt/feedback-trial',
    requestsUrl: 'https://uicp.ylb.lt/ideas',
    networkUrl: 'https://uicp.ylb.lt/network',
    authorUrl: 'https://uicp.ylb.lt/author',
    licenseUrl: 'https://uicp.ylb.lt/license',
    privacyUrl: 'https://uicp.ylb.lt/privacy',
    vsCodeFigmaPluginUrl:
      'https://marketplace.visualstudio.com/items?itemName=figma.figma-vscode-extension',
    isbUrl: 'https://isb.ylb.lt/website',
    uicpUrl: 'https://uicp.ylb.lt/website',
    storeUrl: 'https://uicp.ylb.lt/store',
    storeManagementUrl: 'https://uicp.ylb.lt/store-management',
    storeUltimateRequestUrl: 'https://uicp.ylb.lt/ultimate-request',
    howToUseUrl: 'https://uicp.ylb.lt/how-to-use-figma',
  },
  versions: {
    userConsentVersion: '2024.01',
    trialVersion: '2024.04',
    algorithmVersion: 'v3',
    paletteVersion: '2025.06',
    pluginVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
    creditsVersion: '2026.05',
  },
  features: doSpecificMode(webInactiveFeatures, webProFeatures, []),
  lang:
    typeof navigator !== 'undefined'
      ? (navigator.language as Config['lang'])
      : 'en-US',
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

const limitsMapping: { [key: string]: keyof typeof webConfig.limits } = {
  COLORS_ADD: 'sourceColors',
  THEMES_ADD: 'colorThemes',
  PRESETS_CUSTOM_ADD: 'customStops',
  LOCAL_PALETTES: 'localPalettes',
}

webConfig.features.forEach((feature) => {
  const limitKey = limitsMapping[feature.name]
  if (limitKey && webConfig.limits[limitKey] !== undefined)
    feature.limit = webConfig.limits[limitKey]
})

export default webConfig
