import { Data as PaletteData, normalizeShift } from '@yelbolt/engine-ui-color-palette'
import { getPalette, setPalette } from '../db'
import { dispatch, t } from '../context'
import type {
  BaseConfiguration,
  MetaConfiguration,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'

interface Msg {
  data: {
    base: BaseConfiguration
    themes: Array<ThemeConfiguration>
    meta: MetaConfiguration
  }
}

const createPaletteFromRemote = async (msg: Msg) => {
  const existing = await getPalette(msg.data.meta.id)
  if (existing) throw new Error(t('error.addToLocal'))

  const palette = new PaletteData({
    base: {
      name: msg.data.base.name,
      description: msg.data.base.description,
      preset: msg.data.base.preset,
      shift: {
        chroma: normalizeShift(msg.data.base.shift?.chroma, 'CHROMA'),
        hue: normalizeShift(msg.data.base.shift?.hue, 'HUE'),
      },
      areSourceColorsLocked: msg.data.base.areSourceColorsLocked,
      colors: msg.data.base.colors.map((color) => ({
        ...color,
        hue: {
          ...color.hue,
          shift: normalizeShift(color.hue?.shift, 'HUE'),
        },
        chroma: {
          ...color.chroma,
          shift: normalizeShift(color.chroma?.shift, 'CHROMA'),
        },
      })),
      colorSpace: msg.data.base.colorSpace,
      algorithmVersion: msg.data.base.algorithmVersion,
    },
    themes: msg.data.themes,
    meta: {
      id: msg.data.meta.id,
      dates: {
        createdAt: msg.data.meta.dates.createdAt,
        updatedAt: msg.data.meta.dates.updatedAt,
        publishedAt: msg.data.meta.dates.publishedAt,
        openedAt: new Date().toISOString(),
      },
      creatorIdentity: {
        creatorId: msg.data.meta.creatorIdentity.creatorId,
        creatorFullName: msg.data.meta.creatorIdentity.creatorFullName,
        creatorAvatar: msg.data.meta.creatorIdentity.creatorAvatar,
      },
      publicationStatus: {
        isShared: msg.data.meta.publicationStatus.isShared,
        isPublished: msg.data.meta.publicationStatus.isPublished,
      },
    },
  }).makePaletteFullData()

  await setPalette(palette)
  dispatch('LOAD_PALETTE', palette)
}

export default createPaletteFromRemote
