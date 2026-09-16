import { getPalette, setPalette } from '../db'
import { dispatch } from '../context'
import type { FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import type { PaletteMessage } from '@ui-lib/types'

const updatePalette = async ({
  msg,
  isAlreadyUpdated = false,
  shouldLoadPalette = true,
}: {
  msg: PaletteMessage
  isAlreadyUpdated?: boolean
  shouldLoadPalette?: boolean
}) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration =
    (await getPalette(msg.id)) ?? ({} as FullConfiguration)

  msg.items.forEach((item) => {
    const pathParts = item.key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: Record<string, any> = palette

    for (let i = 0; i < pathParts.length - 1; i++) {
      if (current[pathParts[i]] === undefined) current[pathParts[i]] = {}
      current = current[pathParts[i]]
    }

    current[pathParts[pathParts.length - 1]] = item.value
  })

  if (!isAlreadyUpdated) {
    palette.meta.dates.updatedAt = now
    dispatch('UPDATE_PALETTE_DATE', now)
  }

  if (shouldLoadPalette) dispatch('LOAD_PALETTE', palette)

  return setPalette(palette)
}

export default updatePalette
