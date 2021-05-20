import { Moment } from 'moment'
import { Op } from 'sequelize'
import { Inventory, Reservation, RestaurantSettings } from '../models'
import { DEFAULT_BASE_PARTIES_PER_TIME_SLOT } from '../util/restaurants'

export interface InventoryAndReservations {
  readonly inventory: readonly Inventory[]
  readonly reservations: readonly Reservation[]
  readonly config: RestaurantSettings
}

export const queryBetween = async (
  start: Moment,
  end: Moment,
  handler: (x: InventoryAndReservations) => Promise<void>
) => {
  const rowPromise = Inventory.findAll({
    where: {
      time: {
        [Op.between]: [start.toISOString(), end.toISOString()],
      },
    },
  })

  const reservationsPromies = Reservation.findAll({
    where: {
      timestamp: {
        [Op.between]: [start.toISOString(), end.toISOString()],
      },
    },
  })

  const configPromise = RestaurantSettings.findOne({
    where: {
      id: 1,
    },
  })

  const resolved = await Promise.all([
    rowPromise,
    reservationsPromies,
    configPromise,
  ])

  await handler({
    inventory: [...resolved[0]],
    reservations: [...resolved[1]],
    config: resolved[2] ?? {
      base_parties_per_time_slot: DEFAULT_BASE_PARTIES_PER_TIME_SLOT,
    },
  })
}
