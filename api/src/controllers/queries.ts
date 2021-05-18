import { Moment } from 'moment'
import { Op } from 'sequelize'
import { Inventory, RestaurantSettings } from '../models'
import { DEFAULT_BASE_PARTIES_PER_TIME_SLOT } from '../util/restaurants'

export const queryInventoryAndRestaurantSettings = async (
  start: Moment,
  end: Moment,
  handler: (rows: readonly Inventory[], config: RestaurantSettings | undefined) => Promise<void>
) => {
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

  const resolved = await Promise.all([rowPromise, configPromise])

  await handler(
    [...resolved[0]],
    resolved[1] ?? {
      base_parties_per_time_slot: DEFAULT_BASE_PARTIES_PER_TIME_SLOT,
    }
  )
}
