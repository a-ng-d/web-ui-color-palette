import { doScale } from '@unoff/utils'
import { getPalette, setPalette } from '../db'
import { dispatch } from '../context'
import type { FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import type { ScaleMessage } from '@ui-lib/types'

const updateScale = async (msg: ScaleMessage) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration =
    (await getPalette(String(msg.data.id))) ?? ({} as FullConfiguration)

  const theme = palette.themes.find((theme) => theme.isEnabled)
  if (theme !== undefined) theme.scale = msg.data.scale

  if (msg.feature === 'ADD_STOP' || msg.feature === 'DELETE_STOP')
    palette.themes
      .filter((theme) => !theme.isEnabled)
      .forEach((theme) => {
        const currentScaleArray = Object.entries(theme.scale)

        const isInverted = currentScaleArray.every((val, index, arr) => {
          if (index === 0) return true
          return (
            parseFloat(val[1].toString()) <
            parseFloat(arr[index - 1][1].toString())
          )
        })

        const scaleValues = Object.values(theme.scale)
        const scaleMin = !isInverted
          ? Math.max(...scaleValues)
          : Math.min(...scaleValues)
        const scaleMax = !isInverted
          ? Math.min(...scaleValues)
          : Math.max(...scaleValues)

        theme.scale = doScale(
          Object.keys(msg.data.scale).map((stop) => parseFloat(stop)),
          scaleMin,
          scaleMax
        )

        if (!isInverted) {
          const newScaleArray = Object.entries(theme.scale)
          theme.scale = Object.fromEntries(newScaleArray.reverse())
        }
      })

  palette.base.preset = msg.data.preset
  palette.base.shift = msg.data.shift

  palette.meta.dates.updatedAt = now
  dispatch('UPDATE_PALETTE_DATE', now)
  dispatch('LOAD_PALETTE', palette)

  return setPalette(palette)
}

export default updateScale
