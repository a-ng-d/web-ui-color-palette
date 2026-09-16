import { getPalette, setPalette } from '../db'
import { dispatch } from '../context'
import type { FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import type { ThemesMessage } from '@ui-lib/types'

const updateThemes = async (msg: ThemesMessage) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration =
    (await getPalette(msg.id)) ?? ({} as FullConfiguration)

  palette.themes = msg.data

  palette.meta.dates.updatedAt = now
  dispatch('UPDATE_PALETTE_DATE', now)

  return setPalette(palette)
}

export default updateThemes
