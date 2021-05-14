import { Controller, Get, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import moment, { Moment } from 'moment'
import { start } from 'repl'
import { Op } from 'sequelize'
import { DEFAULT_BASE_PARTIES_PER_TIME_SLOT, Inventory, RestaurantSettings } from '../models'
import { buildArray, repeat } from '../util/arrays'
import { buildMap } from '../util/maps'

const FIFTEEN_MINUTE_WINDOWS_PER_DAY = (24 * 60) / 15

@Controller('inventory')
export class InventoryController {
  @Post('query')
  private query(req: Request, res: Response) {
    const date = moment(req.body.forMonth)

    const startDate = moment(date).startOf('month')
    const endDate = moment(date).endOf('month')

    this.queryInventoryAndRestaurantSettings(startDate, endDate, (rows, config) => {
      const capacityByDayOfMonth = {}

      console.log('Query: read', rows.length, 'rows')

      // Fill in all of the days currently in the database
      for (const row of rows) {
        const dayOfMonth = moment(row.date).date()

        capacityByDayOfMonth[dayOfMonth - 1] = row.capacity
          // Negative entries imply that no capacity has been set, so use the
          // default in that case.
          .map(x => (x >= 0 ? x : config.base_parties_per_time_slot))
      }

      // Fill in all of the other days
      for (let day = 0; day < date.daysInMonth(); day++) {
        if (capacityByDayOfMonth[String(day)] !== undefined) {
          continue
        }

        capacityByDayOfMonth[String(day)] = repeat(
          config.base_parties_per_time_slot,
          FIFTEEN_MINUTE_WINDOWS_PER_DAY
        )
      }

      res.json({ capacityByDayOfMonth })
    }).catch(error => {
      res.sendStatus(500)
    })
  }

  @Post('update')
  private update(req: Request, res: Response) {
    const newCapacity: number = req.body.newCapacity
    const selectedTimes: { [key: number]: readonly number[] } = req.body.selectedTimes

    console.log('Updating: ', req.body)

    const date = moment(req.body.forDaysInMonth)
    const startDate = moment(date).startOf('month')
    const endDate = moment(date).endOf('month')

    // Merge all existing rows with the new selectedTimes.
    this.queryInventoryAndRestaurantSettings(startDate, endDate, async (rows, config) => {
      const rowsByDayOfMonth: ReadonlyMap<number, Inventory> = buildMap(
        rows,
        (row: Inventory) => moment(row.date).date(),
        row => row
      )

      console.log('Read ' + rowsByDayOfMonth.size + ' rows.')
      console.log('Updating dates between', startDate, 'and', endDate)

      for (let dayOfMonth = startDate.date(); dayOfMonth < endDate.date(); dayOfMonth++) {
        const newTimes = new Set(selectedTimes[dayOfMonth] ?? [])

        // If we're not updating this date, skip to the next one.
        if (newTimes.size === 0) {
          console.log('Skipping date', dayOfMonth)
          continue
        }

        const capacity = buildArray(
          FIFTEEN_MINUTE_WINDOWS_PER_DAY,
          // If this time slot isn't supposed to be present, use a negative value.
          x => (newTimes.has(x) ? newCapacity : -1)
        )

        // Is this a new date configuration?
        if (!rowsByDayOfMonth.has(dayOfMonth)) {
          await Inventory.create({
            date: moment(startDate)
              .add(dayOfMonth - 1, 'days')
              .toDate(),
            capacity,
          })
          continue
        }

        // Otherwise we're updating an existing date.
        const row = rowsByDayOfMonth.get(dayOfMonth)
        await Inventory.update(
          {
            ...row,
            capacity: buildArray(FIFTEEN_MINUTE_WINDOWS_PER_DAY, x =>
              // Only overwrite the selected times.
              newTimes.has(x) ? newCapacity : row.capacity[x]
            ),
          },
          { where: { id: row.id } }
        )
        console.log('Updating date', dayOfMonth, newCapacity)
      }

      res.sendStatus(200)
    }).catch(error => {
      console.log(error)
      res.sendStatus(500)
    })
  }

  private queryInventoryAndRestaurantSettings(
    start: Moment,
    end: Moment,
    handler: (rows: readonly Inventory[], config: RestaurantSettings | undefined) => void
  ) {
    const rowPromise = Inventory.findAll({
      where: {
        date: {
          [Op.between]: [start.toISOString(), end.toISOString()],
        },
      },
    })

    const configPromise = RestaurantSettings.findOne({
      where: {
        id: 1,
      },
    })

    return Promise.all([rowPromise, configPromise]).then(resolved => {
      handler(
        [...resolved[0]],
        resolved[1] ?? {
          base_parties_per_time_slot: DEFAULT_BASE_PARTIES_PER_TIME_SLOT,
        }
      )
    })
  }
}
