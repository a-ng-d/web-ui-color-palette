import { Explore } from '@ui-lib/ui/services'
import { WithConfig, WithTranslation } from '@ui-lib/ui/components'
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
