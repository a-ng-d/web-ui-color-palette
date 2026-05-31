import { WithConfig, WithTranslation } from 'ui-ui-color-palette/ui/components'
import { ColorWheel } from 'ui-ui-color-palette/ui/services'
import { useAppState } from '../data/AppStateContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedColorWheel = WithConfig(WithTranslation(ColorWheel as any) as any) as any

export default function WheelPage() {
  const { state, setState } = useAppState()

  return (
    <WrappedColorWheel
      {...state}
      onChangeService={(e: Partial<typeof state>) => setState(e)}
    />
  )
}
