import { WithConfig, WithTranslation } from 'ui-ui-color-palette/ui/components'
import { Explore } from 'ui-ui-color-palette/ui/services'
import { useAppState } from '../data/AppStateContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedExplore = WithConfig(WithTranslation(Explore as any) as any) as any

export default function ExplorePage() {
  const { state, setState } = useAppState()

  return (
    <WrappedExplore
      {...state}
      onChangeService={(e: Partial<typeof state>) => setState(e)}
    />
  )
}
