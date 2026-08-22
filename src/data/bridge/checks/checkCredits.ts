import webConfig from '../../webConfig'
import { dispatch } from '../context'

const addHours = (date: Date, hours: number) =>
  new Date(date.getTime() + hours * 60 * 60 * 1000)

const checkCredits = async () => {
  const creditsCountStr = window.localStorage.getItem('credits_count')
  const renewDateStr = window.localStorage.getItem('credits_renew_date')
  const creditsVersion = window.localStorage.getItem('credits_version')

  const now = new Date()

  let creditsCount =
    creditsCountStr !== null ? parseFloat(creditsCountStr) : NaN
  let renewDate: Date | null =
    renewDateStr !== null && !Number.isNaN(parseInt(renewDateStr, 10))
      ? new Date(parseInt(renewDateStr, 10))
      : null

  const periodHours =
    webConfig.plan.creditsRenewalPeriodHours ??
    webConfig.plan.creditsRenewalPeriodDays * 24

  if (renewDate === null) {
    const next = addHours(now, periodHours)
    window.localStorage.setItem('credits_renew_date', next.getTime().toString())
    renewDate = next
  }

  if (renewDate.getTime() <= now.getTime()) {
    window.localStorage.setItem(
      'credits_count',
      webConfig.plan.creditsLimit.toString()
    )
    const next = addHours(now, periodHours)
    window.localStorage.setItem('credits_renew_date', next.getTime().toString())
    creditsCount = webConfig.plan.creditsLimit
  }

  if (Number.isNaN(creditsCount)) {
    window.localStorage.setItem(
      'credits_count',
      webConfig.plan.creditsLimit.toString()
    )
    creditsCount = webConfig.plan.creditsLimit
  }

  if (creditsVersion !== webConfig.versions.creditsVersion) {
    window.localStorage.setItem(
      'credits_version',
      webConfig.versions.creditsVersion
    )
    window.localStorage.setItem(
      'credits_count',
      webConfig.plan.creditsLimit.toString()
    )
    const next = addHours(now, periodHours)
    window.localStorage.setItem('credits_renew_date', next.getTime().toString())
    creditsCount = webConfig.plan.creditsLimit
    renewDate = next
  }

  dispatch('CHECK_CREDITS', {
    creditsCount,
    creditsRenewalDate: renewDate?.getTime() ?? null,
  })

  return creditsCount
}

export default checkCredits
