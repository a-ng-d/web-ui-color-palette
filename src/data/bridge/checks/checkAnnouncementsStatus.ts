import { dispatch } from '../context'

const checkAnnouncementsStatus = (remoteVersion: string) => {
  const localVersion = window.localStorage.getItem('announcements_version')
  const isOnboardingRead = window.localStorage.getItem('is_onboarding_read')

  if (localVersion === null && remoteVersion === null)
    return dispatch('PUSH_ANNOUNCEMENTS_STATUS', { status: 'NO_ANNOUNCEMENTS' })

  if (localVersion === null && isOnboardingRead === null)
    return dispatch('PUSH_ONBOARDING_STATUS', {
      status: 'DISPLAY_ONBOARDING_DIALOG',
    })

  if (localVersion === null)
    return dispatch('PUSH_ANNOUNCEMENTS_STATUS', {
      status: 'DISPLAY_ANNOUNCEMENTS_DIALOG',
    })

  const remoteMajorVersion = remoteVersion.split('.')[0]
  const remoteMinorVersion = remoteVersion.split('.')[1]
  const localMajorVersion = localVersion.split('.')[0]
  const localMinorVersion = localVersion.split('.')[1]

  if (remoteMajorVersion !== localMajorVersion)
    return dispatch('PUSH_ANNOUNCEMENTS_STATUS', {
      status: 'DISPLAY_ANNOUNCEMENTS_DIALOG',
    })

  if (remoteMinorVersion !== localMinorVersion)
    return dispatch('PUSH_ANNOUNCEMENTS_STATUS', {
      status: 'DISPLAY_ANNOUNCEMENTS_NOTIFICATION',
    })

  return dispatch('PUSH_ANNOUNCEMENTS_STATUS', { status: 'NO_ANNOUNCEMENTS' })
}

export default checkAnnouncementsStatus
