import webConfig from '../webConfig'
import copyShareLink from '../shareLink'
import updateThemes from './updates/updateThemes'
import updateSettings from './updates/updateSettings'
import updateScale from './updates/updateScale'
import updatePalette from './updates/updatePalette'
import updateColors from './updates/updateColors'
import enableTrial from './plans/enableTrial'
import jumpToPalette from './gets/jumpToPalette'
import getPalettesOnCurrentPage from './gets/getPalettesOnCurrentPage'
import deletePalette from './deletions/deletePalette'
import createPaletteFromRemote from './creations/createPaletteFromRemote'
import createPaletteFromDuplication from './creations/createPaletteFromDuplication'
import createPalette from './creations/createPalette'
import { dispatch, navigate } from './context'
import checkUserPreferences from './checks/checkUserPreferences'
import checkUserLicense from './checks/checkUserLicense'
import checkUserConsent from './checks/checkUserConsent'
import checkTrialStatus from './checks/checkTrialStatus'
import checkEditorType from './checks/checkEditorType'
import checkCredits from './checks/checkCredits'
import checkAnnouncementsStatus from './checks/checkAnnouncementsStatus'

const paletteMutationQueues = new Map<string, Promise<void>>()

const runSerializedByPaletteId = <T>(
  id: string | undefined,
  task: () => Promise<T>
): Promise<T> => {
  const key = id ?? '__no_id__'
  const previous = paletteMutationQueues.get(key) ?? Promise.resolve()
  const result = previous.then(task, task)
  paletteMutationQueues.set(
    key,
    result.then(
      () => undefined,
      () => undefined
    )
  )
  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleBridgeMessage = async (path: any) => {
  const actions: Record<string, () => void | Promise<void>> = {
    // Initialisation
    LOAD_DATA: () => {
      dispatch('CHECK_USER_AUTHENTICATION', {
        id: '',
        fullName: '',
        avatar: '',
        accessToken: window.localStorage.getItem('supabase_access_token'),
        refreshToken: window.localStorage.getItem('supabase_refresh_token'),
      })
      dispatch('CHECK_ANNOUNCEMENTS_VERSION')
      dispatch('CHECK_EDITOR', {
        id: '',
        editor: webConfig.env.editor,
      })

      checkUserConsent(path.data.userConsent)
        .then(() => checkTrialStatus())
        .then(() => checkCredits())
        .then(() => checkUserPreferences())
        .then(() => checkUserLicense())
    },

    // Announcements
    CHECK_ANNOUNCEMENTS_STATUS: () =>
      checkAnnouncementsStatus(path.data.version),

    // Updates
    UPDATE_SCALE: () =>
      runSerializedByPaletteId(path.id, () => updateScale(path)).catch(
        (error) =>
          dispatch('POST_MESSAGE', { type: 'ERROR', message: error.message })
      ),
    UPDATE_COLORS: () =>
      runSerializedByPaletteId(path.id, () => updateColors(path)).catch(
        (error) =>
          dispatch('POST_MESSAGE', { type: 'ERROR', message: error.message })
      ),
    UPDATE_THEMES: () =>
      runSerializedByPaletteId(path.id, () => updateThemes(path)).catch(
        (error) =>
          dispatch('POST_MESSAGE', { type: 'ERROR', message: error.message })
      ),
    UPDATE_SETTINGS: () =>
      runSerializedByPaletteId(path.id, () => updateSettings(path)).catch(
        (error) =>
          dispatch('POST_MESSAGE', { type: 'ERROR', message: error.message })
      ),
    UPDATE_PALETTE: () =>
      runSerializedByPaletteId(path.id, () =>
        updatePalette({
          msg: path,
          isAlreadyUpdated: path.isAlreadyUpdated,
          shouldLoadPalette: path.shouldLoadPalette,
        })
      ).catch((error) =>
        dispatch('POST_MESSAGE', { type: 'ERROR', message: error.message })
      ),
    UPDATE_LANGUAGE: () => {
      window.localStorage.setItem('user_language', path.data.lang)
    },

    // Creations
    CREATE_PALETTE: () =>
      createPalette(path)
        .then((id) => navigate(`/manage?id=${id}`))
        .catch((error) =>
          dispatch('POST_MESSAGE', { type: 'ERROR', message: error.message })
        )
        .finally(() => dispatch('STOP_LOADER')),
    CREATE_PALETTE_FROM_DOCUMENT: () =>
      console.log(
        '[WebBridge] CREATE_PALETTE_FROM_DOCUMENT — no-op on web',
        path
      ),
    CREATE_PALETTE_FROM_REMOTE: () =>
      createPaletteFromRemote(path)
        .catch((error) =>
          dispatch('POST_MESSAGE', { type: 'INFO', message: error.message })
        )
        .finally(() => dispatch('STOP_LOADER')),

    // Canvas sync — no-op on web
    SYNC_LOCAL_STYLES: () => {
      dispatch('STOP_LOADER')
      dispatch('POST_MESSAGE', {
        type: 'INFO',
        message: 'Local styles sync is not available on the web platform.',
      })
    },
    SYNC_LOCAL_VARIABLES: () => {
      dispatch('STOP_LOADER')
      dispatch('POST_MESSAGE', {
        type: 'INFO',
        message: 'Local variables sync is not available on the web platform.',
      })
    },
    SYNC_LOCAL_TOKENS: () => {
      dispatch('STOP_LOADER')
      dispatch('POST_MESSAGE', {
        type: 'INFO',
        message: 'Local tokens sync is not available on the web platform.',
      })
    },
    CREATE_DOCUMENT: () => {
      dispatch('STOP_LOADER')
      console.log('[WebBridge] CREATE_DOCUMENT — no-op on web', path)
    },
    UPDATE_DOCUMENT: () => {
      dispatch('STOP_LOADER')
      console.log('[WebBridge] UPDATE_DOCUMENT — no-op on web', path)
    },

    // KV storage
    SET_ITEMS: () =>
      path.items.forEach((item: { key: string; value: unknown }) => {
        if (typeof item.value === 'object')
          window.localStorage.setItem(item.key, JSON.stringify(item.value))
        else if (
          typeof item.value === 'boolean' ||
          typeof item.value === 'number'
        )
          window.localStorage.setItem(item.key, String(item.value))
        else window.localStorage.setItem(item.key, item.value as string)
      }),
    GET_ITEMS: () =>
      path.items.forEach((item: string) =>
        dispatch(`GET_ITEM_${item.toUpperCase()}`, {
          value: window.localStorage.getItem(item),
        })
      ),
    DELETE_ITEMS: () =>
      path.items.forEach((item: string) =>
        window.localStorage.removeItem(item)
      ),

    // Notifications
    POST_MESSAGE: () =>
      dispatch('POST_MESSAGE', {
        type: path.data.type,
        message: path.data.message,
      }),

    // Navigation
    OPEN_IN_BROWSER: () => {
      window.open(path.data.url, '_blank')
    },

    // Palette CRUD
    GET_PALETTES: () => getPalettesOnCurrentPage(),
    JUMP_TO_PALETTE: () =>
      jumpToPalette(path.id).catch((error) =>
        dispatch('POST_MESSAGE', { type: 'ERROR', message: error.message })
      ),
    DUPLICATE_PALETTE: () =>
      createPaletteFromDuplication(path.id)
        .finally(() => {
          getPalettesOnCurrentPage()
          dispatch('STOP_LOADER')
        })
        .catch((error) =>
          dispatch('POST_MESSAGE', { type: 'ERROR', message: error.message })
        ),
    DELETE_PALETTE: () =>
      deletePalette(path.id)
        .finally(() => {
          getPalettesOnCurrentPage()
          dispatch('STOP_LOADER')
        })
        .catch((error) =>
          dispatch('POST_MESSAGE', { type: 'ERROR', message: error.message })
        ),
    COPY_SHARE_LINK: () =>
      copyShareLink(path.id).catch((error) =>
        dispatch('POST_MESSAGE', { type: 'ERROR', message: error.message })
      ),

    // Plan / trial / pro
    ENABLE_TRIAL: () => {
      enableTrial(path.data.trialTime, path.data.trialVersion).then(() =>
        checkTrialStatus()
      )
    },
    GET_TRIAL: () => dispatch('GET_TRIAL'),
    GET_PRO: () =>
      dispatch('GET_PRICING', {
        licenseTrigger: 'ACTIVATE',
        origin: path.data?.origin ?? 'UNKNOWN',
      }),
    GET_LICENSE: () => dispatch('GET_LICENSE'),
    GO_TO_ULTIMATE_REQUEST: () => {
      window.open(webConfig.urls.storeUltimateRequestUrl, '_blank')
    },
    ENABLE_PRO_PLAN: () => dispatch('ENABLE_PRO_PLAN'),
    LEAVE_PRO_PLAN: () => {
      dispatch('LEAVE_PRO_PLAN')
      checkTrialStatus()
    },
    WELCOME_TO_PRO: () => dispatch('WELCOME_TO_PRO'),
    SIGN_OUT: () =>
      dispatch('SIGN_OUT', {
        connectionStatus: 'UNCONNECTED',
        userFullName: '',
        userAvatar: '',
        userId: '',
      }),

    CHECK_EDITOR_TYPE: () => checkEditorType(),

    // eslint-disable-next-line @typescript-eslint/no-empty-function -- fallback no-op for unhandled message types
    DEFAULT: () => {},
  }

  try {
    return actions[path.type]?.() ?? actions['DEFAULT']()
  } catch (error) {
    console.error('[WebBridge] Unhandled error for', path.type, error)
    return actions['DEFAULT']()
  }
}

let _attached = false

export const startBridge = () => {
  if (_attached) return
  _attached = true

  window.addEventListener('pluginMessage', ((event: CustomEvent) => {
    const path = event.detail?.message?.pluginMessage
    if (path) handleBridgeMessage(path)
  }) as EventListener)
}
