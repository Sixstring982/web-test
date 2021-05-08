import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  PrimaryKey, Table,
  UpdatedAt
} from 'sequelize-typescript'

@Table({ tableName: 'restaurantsettings' })
export class RestaurantSettings extends Model<RestaurantSettings> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Column(DataType.INTEGER)
  base_parties_per_time_slot: number;

  @Column
  address: string

  @DeletedAt
  deleted_at: string

  @CreatedAt
  created_at: string

  @UpdatedAt
  updated_at: string
}

