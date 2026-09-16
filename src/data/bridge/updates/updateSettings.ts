import { getPalette, setPalette } from '../db'
import { dispatch } from '../context'
import type { SettingsMessage } from 'ui-ui-color-palette/types'
import type { FullConfiguration } from '@yelbolt/engine-ui-color-palette'

const updateSettings = async (msg: SettingsMessage) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration =
    (await getPalette(msg.id)) ?? ({} as FullConfiguration)

  const theme = palette.themes.find((theme) => theme.isEnabled)
  if (theme !== undefined) {
    theme.visionSimulationMode = msg.data.visionSimulationMode
    theme.textColorsTheme = msg.data.textColorsTheme
  }

  palette.base.name = msg.data.name
  palette.base.description = msg.data.description
  palette.base.colorSpace = msg.data.colorSpace
  palette.base.algorithmVersion = msg.data.algorithmVersion

  palette.meta.dates.updatedAt = now
  dispatch('UPDATE_PALETTE_DATE', now)

  return setPalette(palette)
}

export default updateSettings
