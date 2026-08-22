import { dispatch } from '../context'

const checkUserLicense = async () => {
  const licenseKey = window.localStorage.getItem('user_license_key')
  const instanceId = window.localStorage.getItem('user_license_instance_id')

  if (licenseKey !== null && instanceId !== null) {
    dispatch('CHECK_USER_LICENSE', { licenseKey, instanceId })
    return true
  }
  return false
}

export default checkUserLicense
