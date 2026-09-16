import { ImagePalette } from 'ui-ui-color-palette/ui/services'
import { WithConfig, WithTranslation } from 'ui-ui-color-palette/ui/components'
import { useAppState } from '../data/AppStateContext'

/* eslint-disable @typescript-eslint/no-explicit-any -- HOC wrappers erase the wrapped component's prop types */
const WrappedImagePalette = WithConfig(
  WithTranslation(ImagePalette as any) as any
) as any
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function ExtractPage() {
  const { state, setState } = useAppState()

  return (
    <WrappedImagePalette
      {...state}
      onChangeService={(e: Partial<typeof state>) => setState(e)}
    />
  )
}
