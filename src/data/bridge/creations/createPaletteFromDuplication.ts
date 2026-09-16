import { uid } from 'uid'
import { getPalette, setPalette } from '../db'
import { dispatch, t } from '../context'
import type { FullConfiguration } from '@yelbolt/engine-ui-color-palette'

const createPaletteFromDuplication = async (id: string) => {
  const raw = await getPalette(id)
  if (!raw) throw new Error(t('error.unfoundPalette'))

  const now = new Date().toISOString()
  const palette: FullConfiguration = { ...raw }

  palette.base.name = t('browse.copy', { name: palette.base.name })
  palette.meta.id = uid()
  palette.meta.publicationStatus.isPublished = false
  palette.meta.publicationStatus.isShared = false
  palette.meta.dates.updatedAt = now
  palette.meta.dates.createdAt = now
  palette.meta.dates.publishedAt = ''
  palette.meta.dates.openedAt = now
  palette.meta.creatorIdentity.creatorId = ''
  palette.meta.creatorIdentity.creatorFullName = ''
  palette.meta.creatorIdentity.creatorAvatar = ''

  await setPalette(palette)
  dispatch('LOAD_PALETTE', palette)
}

export default createPaletteFromDuplication
