import type { ConsentConfiguration } from '@unoff/ui'
import { dispatch } from '../context'
import webConfig from '../../webConfig'

const checkUserConsent = async (userConsent: Array<ConsentConfiguration>) => {
  const currentUserConsentVersion = window.localStorage.getItem(
    'user_consent_version'
  )

  const userConsentData = await Promise.all(
    userConsent.map(async (consent) => ({
      ...consent,
      isConsented:
        window.localStorage.getItem(`${consent.id}_user_consent`) === 'true',
    }))
  )

  dispatch('CHECK_USER_CONSENT', {
    mustUserConsent:
      currentUserConsentVersion !== webConfig.versions.userConsentVersion ||
      currentUserConsentVersion === undefined,
    userConsent: userConsentData,
  })
}

export default checkUserConsent
