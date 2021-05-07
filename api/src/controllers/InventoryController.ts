import { Controller, Get } from '@overnightjs/core'
import { Request, Response } from 'express'

@Controller('inventory/list')
export class InventoryController {
  @Get('')
  private async get(req: Request, res: Response) {
    return res.sendStatus(200)
  }
}
