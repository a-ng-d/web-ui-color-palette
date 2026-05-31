import { WithConfig, WithTranslation } from 'ui-ui-color-palette/ui/components'
import { GenAI } from 'ui-ui-color-palette/ui/services'
import { useAppState } from '../data/AppStateContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedGenAI = WithConfig(WithTranslation(GenAI as any) as any) as any

export default function GenPage() {
  const { state, setState } = useAppState()

  return (
    <WrappedGenAI
      {...state}
      onChangeService={(e: Partial<typeof state>) => setState(e)}
    />
  )
}
