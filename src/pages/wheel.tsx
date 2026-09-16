import { ColorWheel } from '@ui-lib/ui/services'
import { WithConfig, WithTranslation } from '@ui-lib/ui/components'
import { useAppState } from '../data/AppStateContext'

/* eslint-disable @typescript-eslint/no-explicit-any -- HOC wrappers erase the wrapped component's prop types */
const WrappedColorWheel = WithConfig(
  WithTranslation(ColorWheel as any) as any
) as any
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function WheelPage() {
  const { state, setState } = useAppState()

  return (
    <WrappedColorWheel
      {...state}
      onChangeService={(e: Partial<typeof state>) => setState(e)}
    />
  )
}
