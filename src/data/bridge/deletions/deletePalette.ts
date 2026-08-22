import { deletePalette as dbDeletePalette } from '../db'

const deletePalette = async (id: string) => dbDeletePalette(id)

export default deletePalette
