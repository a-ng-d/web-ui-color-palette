import { dispatch } from '../context'

const enableTrial = async (trialTime: number, trialVersion: string) => {
  const now = new Date().getTime()

  window.localStorage.setItem('trial_start_date', now.toString())
  window.localStorage.setItem('trial_version', trialVersion)
  window.localStorage.setItem('trial_time', trialTime.toString())

  dispatch('ENABLE_TRIAL', { date: now, trialTime })
}

export default enableTrial
