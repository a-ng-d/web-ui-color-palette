import { getPalette, setPalette } from '../db'
import { dispatch, t } from '../context'

const jumpToPalette = async (id: string) => {
  const palette = await getPalette(id)
  if (!palette) throw new Error(t('error.unfoundPalette'))

  palette.meta.dates.openedAt = new Date().toISOString()
  await setPalette(palette)
  dispatch('LOAD_PALETTE', palette)
}

export default jumpToPalette
