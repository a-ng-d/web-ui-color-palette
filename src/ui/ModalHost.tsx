import { createPortal } from 'preact/compat'
import { Modal } from '@ui-lib/ui/contexts'
import { WithConfig, WithTranslation } from '@ui-lib/ui/components'
import { useAppState } from '../data/AppStateContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedModal = WithConfig(WithTranslation(Modal as any) as any) as any

export function ModalHost() {
  const { state, setState } = useAppState()

  if (state.modalContext === 'EMPTY') return null

  const target =
    typeof document !== 'undefined' ? document.getElementById('modal') : null
  if (!target) return null

  return createPortal(
    <WrappedModal
      {...state}
      context={state.modalContext}
      onChangePublication={setState}
      onManageLicense={setState}
      onSkipAndResetPalette={setState}
      onSubscribe={setState}
      onClose={() =>
        setState({
          modalContext: 'EMPTY',
          announcements: {
            version: state.announcements.version,
            status: 'NO_ANNOUNCEMENTS',
          },
        })
      }
    />,
    target
  )
}
