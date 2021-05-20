import { Controller, Get, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import { RestaurantSettings } from '../models/RestaurantSettings'
import { DEFAULT_BASE_PARTIES_PER_TIME_SLOT } from '../util/restaurants'

@Controller('restaurantsettings')
export class RestaurantSettingsController {
  @Get('')
  private async get(req: Request, res: Response) {
    const settings = await RestaurantSettings.findOne({ where: { id: 1 } })

    if (settings) {
      return res.json(settings)
    }

    // No settings means that we should write some default settings. We only
    // need one of these.
    const initialSettings = new RestaurantSettings({
      id: 1,
      base_parties_per_time_slot: DEFAULT_BASE_PARTIES_PER_TIME_SLOT,
      address: '123 Easy Street, New York, NY, USA',
    })

    RestaurantSettings.create(initialSettings)

    return res.json(initialSettings)
  }

  @Post('')
  private async save(req: Request, res: Response) {
    const newSettings = req.body

    console.log(req)

    const settings = (await RestaurantSettings.findOne()) ?? {}

    settings.base_parties_per_time_slot = newSettings.basePartySize

    RestaurantSettings.update(
      { base_parties_per_time_slot: newSettings.basePartySize },
      { where: { id: 1 } }
    )
  }
}
