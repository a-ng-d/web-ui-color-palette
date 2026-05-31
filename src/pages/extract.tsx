import { WithConfig, WithTranslation } from 'ui-ui-color-palette/ui/components'
import { ImagePalette } from 'ui-ui-color-palette/ui/services'
import { useAppState } from '../data/AppStateContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedImagePalette = WithConfig(WithTranslation(ImagePalette as any) as any) as any

export default function ExtractPage() {
  const { state, setState } = useAppState()

  return (
    <WrappedImagePalette
      {...state}
      onChangeService={(e: Partial<typeof state>) => setState(e)}
    />
  )
}
