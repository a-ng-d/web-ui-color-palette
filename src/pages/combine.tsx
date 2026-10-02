import { useLocation } from 'preact-iso'
import { useEffect } from 'preact/hooks'
import { COMBINE_COLORS_CONTEXTS } from '@ui-lib/ui/services/CombineColors'
import { CombineColors } from '@ui-lib/ui/services'
import { WithConfig, WithTranslation } from '@ui-lib/ui/components'
import { useAppState } from '../data/AppStateContext'
import type { AppState } from '@ui-lib/ui/App'
import type { Context } from '@ui-lib/types'

/* eslint-disable @typescript-eslint/no-explicit-any -- HOC wrappers erase the wrapped component's prop types */
const WrappedCombineColors = WithConfig(
  WithTranslation(CombineColors as any) as any
) as any
/* eslint-enable @typescript-eslint/no-explicit-any */

const DEFAULT_CONTEXT = COMBINE_COLORS_CONTEXTS[0]

const toContext = (segment?: string): Context | undefined =>
  COMBINE_COLORS_CONTEXTS.find((context) => context.toLowerCase() === segment)

export default function CombinePage({ context }: { context?: string }) {
  const { route } = useLocation()
  const { state, setState } = useAppState()
  const currentContext = toContext(context)

  useEffect(() => {
    if (!currentContext) route(`/colors/${DEFAULT_CONTEXT.toLowerCase()}`, true)
  }, [currentContext, route])

  if (!currentContext) return null

  return (
    <div className="web-combine-page">
      <WrappedCombineColors
        {...state}
        context={currentContext}
        onChangeContext={(next: Context) =>
          route(`/colors/${next.toLowerCase()}`)
        }
        onChangeService={(e: Partial<AppState>) => setState(e)}
      />
    </div>
  )
}
