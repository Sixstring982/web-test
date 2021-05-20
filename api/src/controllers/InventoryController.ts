import { Controller, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import moment from 'moment'
import { Inventory } from '../models'
import { InventoryAndReservations, queryBetween } from './queries'

////////////////////////
// API: Query
////////////////////////

interface QueryRequest {
  /** ISO time string representing the start of the query. */
  readonly startTime: string

  /** ISO time string representing the end of the query. */
  readonly endTime: string
}

interface QueryResponse {
  /**
   *  The base number of available reservations. If a time is not in
   * `overrides`, this capacity should apply.
   */
  readonly baseCapacity: number

  /**
   * A map of:
   * Keys: time windows, in 15-minute intervals.
   * Values: the capacity of each window, starting at the time interval.
   */
  readonly overrides: { [key: string]: number }

  /**
   * A map of:
   * Keys: time windows, in 15-minute intervals.
   * Values: The number of reservations in each window, starting at the time 
   * interval.
   */
  readonly reservations: { [key: string]: number }
}

////////////////////////
// API: Update
////////////////////////

interface UpdateRequest {
  /** The capacity to write to all of the given times. */
  readonly newCapacity: number

  /**
   * The times to write the new capacity to. These will all be rounded down to
   * the nearest 15-minute window, and deduplicated.
   */
  readonly times: readonly string[]
}

@Controller('inventory')
export class InventoryController {
  @Post('query')
  private query(req: Request, res: Response) {
    const request = req.body as QueryRequest

    const startTime = moment(request.startTime)
    const endTime = moment(request.endTime)

    queryBetween(
      startTime,
      endTime,
      async ({ inventory, reservations, config }: InventoryAndReservations) => {
        const baseCapacity = config.base_parties_per_time_slot

        const overrides = {}

        inventory.forEach(row => {
          overrides[row.time.toISOString()] = row.capacity
        })

        const reservationsByTime = {}

        reservations.forEach(r => {
          const timeIso = r.timestamp.toISOString()

          if (reservationsByTime[timeIso] === undefined) {
            reservationsByTime[timeIso] = 1
          } else {
            reservationsByTime[timeIso]++
          }
        })

        const response: QueryResponse = {
          baseCapacity,
          overrides,
          reservations: reservationsByTime,
        }

        res.json(response)
      }
    ).catch(error => {
      console.log(error)
      res.sendStatus(500)
    })
  }

  @Post('update')
  private update(req: Request, res: Response) {
    const { newCapacity, times } = req.body as UpdateRequest

    // Continuation: update all times as a promise
    // TODO(sixstring982): Make this transactional.
    const updateTimes = (
      times: readonly string[]
    ): Promise<ReadonlyArray<boolean>> => {
      // Tail case
      if (times.length === 0) {
        return Promise.resolve([true])
      }

      const time = times[0]
      const givenMoment = moment(time)
      const updateMoment = moment(givenMoment)
        // Clamp to nearest 15-minute period
        .startOf('minute')
        .subtract(givenMoment.minute() % 15, 'minutes')

      console.log('GIVEN MOMENT TRUNCATED: ', givenMoment.minute() % 15)

      const resultPromise: Promise<boolean> = Inventory.upsert({
        time: updateMoment.toDate(),
        capacity: newCapacity,
      })

      return resultPromise.then(thisResult =>
        updateTimes(times.slice(1)).then(tailResults => [
          thisResult,
          ...tailResults,
        ])
      )
    }

    return updateTimes(times)
      .then(allResults => {
        console.log('Committed', allResults.length, 'rows.')
        res.sendStatus(200)
      })
      .catch(error => {
        console.log(error)
        res.sendStatus(500)
      })
  }
}
