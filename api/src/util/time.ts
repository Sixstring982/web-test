import { Moment } from 'moment'
import moment from 'moment'

export const truncateToNearest15Minutes = (m: Moment): Moment => {
  const result = moment(m).startOf('minute')

  result.subtract(result.minute() % 15, 'minutes')

  return result
}

export const fifteenMinuteIndexSinceMidnight = (m: Moment): number => {
  const startOfDay = moment(m).startOf('day')

  const minutesSinceMidnight = m.diff(startOfDay, 'minutes')

  return Math.floor(minutesSinceMidnight / 15);
}