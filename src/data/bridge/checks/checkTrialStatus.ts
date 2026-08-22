import webConfig from '../../webConfig'
import { dispatch } from '../context'

const checkTrialStatus = async () => {
  const trialStartDate =
    window.localStorage.getItem('trial_start_date') !== null
      ? parseFloat(window.localStorage.getItem('trial_start_date') ?? '0')
      : null
  const currentTrialVersion: string =
    window.localStorage.getItem('trial_version') || ''
  const currentTrialTime: number = parseFloat(
    window.localStorage.getItem('trial_time') || '72'
  )

  let consumedTime = 0,
    trialStatus = 'UNUSED'

  if (trialStartDate) {
    consumedTime =
      (new Date().getTime() - new Date(trialStartDate).getTime()) /
      1000 /
      (60 * 60)

    if (consumedTime <= currentTrialTime && webConfig.plan.isTrialEnabled)
      trialStatus = 'PENDING'
    else if (
      consumedTime >= webConfig.plan.trialTime &&
      webConfig.plan.isTrialEnabled
    )
      trialStatus = 'EXPIRED'
    else trialStatus = 'UNUSED'
  }

  let planStatus: string | undefined

  if (trialStatus === 'PENDING' || !webConfig.plan.isProEnabled)
    planStatus = 'PAID'
  else planStatus = undefined

  dispatch('CHECK_TRIAL_STATUS', {
    planStatus,
    trialStatus,
    trialRemainingTime: Math.ceil(
      currentTrialVersion !== webConfig.versions.trialVersion
        ? currentTrialTime - consumedTime
        : webConfig.plan.trialTime - consumedTime
    ),
  })

  if (trialStatus === 'PENDING' || !webConfig.plan.isProEnabled) return 'PAID'
  else return undefined
}

export default checkTrialStatus
