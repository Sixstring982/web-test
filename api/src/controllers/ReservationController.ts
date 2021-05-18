import moment from 'moment'
import { Moment } from 'moment'

import { Controller, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import { fifteenMinuteIndexSinceMidnight, truncateToNearest15Minutes } from '../util/time'
import { Reservation } from '../models/Reservation'
import { Op } from 'sequelize'
import { Inventory, RestaurantSettings } from '../models'
import { queryInventoryAndRestaurantSettings } from './queries'

interface MakeReservationRequest {
  readonly name: string
  readonly email: string
  readonly partySize: number
  readonly time: string
}

@Controller('reservation')
export class ReservationController {
  @Post('make')
  private async query(req: Request, res: Response) {
    const request = req.body as MakeReservationRequest

    queryInventoryAndRestaurantSettings(
      moment(request.time).startOf('day'),
      moment(request.time).endOf('day'),
      async (rows, config) => {
        const capacity = await determineCapacity(moment(request.time), rows[0], config)

        console.log('Available capacity', capacity)

        if (capacity <= 0) {
          res.json({ error: 'Insufficent capacity.' })
          return
        }

        await Reservation.create({
          name: request.name,
          email: request.email,
          timestamp: moment(request.time).toDate(),
          partySize: request.partySize,
        })

        res.sendStatus(200)
      }
    ).catch(e => {
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
