import { uid } from 'uid'
import { Data as PaletteData } from '@yelbolt/engine-ui-color-palette'
import { getPalette, setPalette } from '../db'
import { dispatch, t } from '../context'
import type {
  BaseConfiguration,
  MetaConfiguration,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'

export interface SharedPaletteData {
  base: BaseConfiguration
  themes: Array<ThemeConfiguration>
  meta: MetaConfiguration
}

const RESERVED_IDS = ['local', 'library']

const createPaletteFromLink = async (payload: SharedPaletteData) => {
  const id = RESERVED_IDS.includes(payload.meta.id) ? uid() : payload.meta.id
  const existing = await getPalette(id)
  if (existing) throw new Error(t('error.addToLocal'))

  const now = new Date().toISOString()

  const palette = new PaletteData({
    base: payload.base,
    themes: payload.themes,
    meta: {
      id,
      dates: {
        createdAt: payload.meta.dates?.createdAt || now,
        updatedAt: now,
        publishedAt: '',
        openedAt: now,
      },
      creatorIdentity: payload.meta.creatorIdentity,
      publicationStatus: {
        isPublished: false,
        isShared: false,
      },
    },
  }).makePaletteFullData()

  await setPalette(palette)
  dispatch('LOAD_PALETTE', palette)
}

export default createPaletteFromLink
