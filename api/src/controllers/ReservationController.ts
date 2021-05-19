import moment from 'moment'
import { Moment } from 'moment'

import { Controller, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import { fifteenMinuteIndexSinceMidnight, truncateToNearest15Minutes } from '../util/time'
import { Reservation } from '../models/Reservation'
import { Op } from 'sequelize'
import { Inventory, RestaurantSettings } from '../models'
import { queryInventoryAndRestaurantSettings } from './queries'
import { buildMap } from '../util/maps'

////////////////////////
// API: Make
////////////////////////

interface MakeReservationRequest {
  readonly name: string
  readonly email: string
  readonly partySize: number
  /**
   * ISO time string representing the time of the reservation. Will be rounded
   * down to the nearest 15-minute period.
   */
  readonly time: string
}

type MakeReservationResponse = MakeReservationSuccess | MakeReservationFailure

interface MakeReservationSuccess {
  readonly success: true
  /** ISO time string of the time the reservation was made. */
  readonly time: string
}

interface MakeReservationFailure {
  readonly success: false
  /** ISO time strings of close times that a reservation can be made. */
  readonly suggestedTimes: readonly string[]
}

@Controller('reservation')
export class ReservationController {
  @Post('make')
  private async query(req: Request, res: Response) {
    const request = req.body as MakeReservationRequest

    const requestTime = moment(request.time)

    const truncatedRequestTime = moment(request.time)
      .startOf('minute')
      .subtract(requestTime.minutes() % 15, 'minutes')

    // Search other times for capacity, within +- 2 hours.
    const startTime = moment(truncatedRequestTime).subtract(2, 'hours')
    const endTime = moment(truncatedRequestTime).add(2, 'hours')

    queryInventoryAndRestaurantSettings(startTime, endTime, async (rows, config) => {
      const reservations: readonly Reservation[] = await Reservation.findAll({
        where: {
          timestamp: {
            [Op.between]: [startTime.toISOString(), endTime.toISOString()],
          },
        },
      })

      const capacityByTime = buildMap(
        rows,
        r => r.time.toISOString(),
        r => r.capacity
      )

      const capacityAtTime = (time: Moment) => {
        const timeIso = time.toISOString()
        const configured = capacityByTime.get(timeIso) ?? config.base_parties_per_time_slot

        const reserved = reservations.filter(x => x.timestamp.toISOString() === timeIso).length

        return configured - reserved
      }

      const capacityAtRequestedTime = capacityAtTime(truncatedRequestTime)
      console.log('Capacity at requested time', capacityAtRequestedTime)

      // Happy path: we have capacity at that time!
      if (capacityAtRequestedTime > 0) {
        await Reservation.create({
          name: request.name,
          email: request.email,
          timestamp: truncatedRequestTime.toDate(),
          partySize: request.partySize,
        })

        const response: MakeReservationSuccess = {
          success: true,
          // Parrot the time right back, they don't need to know we truncated it
          // to fit in our system.
          time: request.time,
        }
        res.json(response)
        return
      }

      // If not, send back some suggested times, if any. Search away from the
      // time that the customer wants, but only give them up to four more options.
      const suggestedTimes: string[] = []
      outer: for (let delta = 15; delta < 120; delta += 15) {
        const times = [
          moment(truncatedRequestTime).add(delta, 'minutes'),
          moment(truncatedRequestTime).subtract(delta, 'minutes'),
        ]

        for (const time of times) {
          if (capacityAtTime(time) > 0) {
            suggestedTimes.push(time.toISOString())
            if (suggestedTimes.length >= 4) {
              break outer
            }
          }
        }
      }

      const response: MakeReservationFailure = {
        success: false,
        suggestedTimes,
      }
      res.json(response)
    }).catch(e => {
      console.log(e)
      res.sendStatus(500)
    })
  }
}

const determineCapacity = async (
  atMoment: Moment,
  inventory?: Inventory,
  config?: RestaurantSettings
): Promise<number> => {
  const index = fifteenMinuteIndexSinceMidnight(atMoment)
  const capacity = (() => {
    const c = inventory?.capacity[index]
    if (c === undefined) {
      return config?.base_parties_per_time_slot
    }
    if (c < 0) {
      return config.base_parties_per_time_slot
    }
    return c
  })()

  if (capacity === undefined) {
    throw new Error("Can't determine capacity for: " + atMoment.toISOString())
  }

  // Find the bounds of this particular reservation
  const startMoment = truncateToNearest15Minutes(moment(atMoment))
  const endMoment = moment(startMoment).add(15, 'minutes')

  const reservations = await Reservation.findAll({
    where: {
      timestamp: {
        [Op.between]: [startMoment.toISOString(), endMoment.toISOString()],
      },
    },
  })

  return capacity - reservations.length
}
