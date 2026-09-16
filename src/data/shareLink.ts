import { getPalette } from './bridge/db'
import { dispatch, t } from './bridge/context'
import type { FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import type { SharedPaletteData } from './bridge/creations/createPaletteFromLink'

export const buildShareLink = (palette: FullConfiguration): string => {
  const payload: SharedPaletteData = {
    base: palette.base,
    themes: palette.themes,
    meta: palette.meta,
  }

  const params = new URLSearchParams({
    id: palette.meta.id,
    data: JSON.stringify(payload),
  })

  return `${window.location.origin}/manage?${params.toString()}`
}

const copyShareLink = async (id: string): Promise<void> => {
  const palette = await getPalette(id)

  if (!palette) {
    dispatch('POST_MESSAGE', {
      type: 'ERROR',
      message: t('error.copyLinkNoPalette'),
    })
    return
  }

  const link = buildShareLink(palette)

  try {
    await navigator.clipboard.writeText(link)
  } catch {
    dispatch('POST_MESSAGE', {
      type: 'ERROR',
      message: t('error.copyLink'),
    })
  }
}

export default copyShareLink
