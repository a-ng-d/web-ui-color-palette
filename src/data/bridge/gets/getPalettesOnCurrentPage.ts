import { getAllPalettes } from '../db'
import { dispatch } from '../context'

const getPalettesOnCurrentPage = async () => {
  const palettes = await getAllPalettes()
  dispatch('EXPOSE_PALETTES', palettes)
}

export default getPalettesOnCurrentPage
