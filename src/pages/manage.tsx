import { WithConfig, WithTranslation } from 'ui-ui-color-palette/ui/components'
import { ManagePalette } from 'ui-ui-color-palette/ui/services'
import { useAppState } from '../data/AppStateContext'

// Inject config (from ConfigContext) and t (from TolgeeContext) automatically.
// Double `as any` silences the intermediate HOC type mismatch (generic class component
// vs. functional, resolved at runtime since both use the same Preact context).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedManagePalette = WithConfig(WithTranslation(ManagePalette as any) as any) as any

export default function ManagePage() {
  const { state } = useAppState()

  return (
    <WrappedManagePalette
      {...state}
      // appData mirrors the App-level state that ManagePalette uses for
      // modal context, onGoingStep, etc. Partial for now — expanded in Palier 2b.
      appData={state}
    />
  )
}
