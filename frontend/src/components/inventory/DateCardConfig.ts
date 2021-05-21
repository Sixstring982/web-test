export enum DateCardKind {
  EMPTY,
  PAST,
  FULL
}

export interface EmptyDateCardConfig {
  readonly kind: DateCardKind.EMPTY
  readonly key: symbol
}

export const emptyDateCardConfig = (): EmptyDateCardConfig => ({
  kind: DateCardKind.EMPTY,
  key: Symbol()
})

export const isEmptyDateCardConfig = (
  c: DateCardConfig
): c is EmptyDateCardConfig => c.kind === DateCardKind.EMPTY

export interface PastDateCardConfig {
  readonly kind: DateCardKind.PAST
  readonly key: symbol
  readonly dayOfMonth: number
}

export const isPastDateCardConfig = (
  c: DateCardConfig
): c is PastDateCardConfig => c.kind === DateCardKind.PAST

export const pastDateCardForDayOfMonth = (
  dayOfMonth: number
): PastDateCardConfig => ({
  kind: DateCardKind.PAST,
  key: Symbol(),
  dayOfMonth
})

export interface FullDateCardConfig {
  readonly kind: DateCardKind.FULL
  readonly key: symbol
  readonly month: number
  readonly dayOfMonth: number
  readonly baseCapacity: number
  /**
   * Key: time index in 15-minute increments from the start of the day.
   * Value: capacity at that time.
   */
  readonly savedTimes: ReadonlyMap<number, number>
  /**
   * Key: time index in 15-minute increments from the start of the day.
   * Value: number of reservations at that time.
   */
  readonly reservationsByTime: ReadonlyMap<number, number>
  /**
   * Times staged to be modified, zero-indexed from the beginning of the day,
   * local time.
   */
  readonly selectedTimes: Set<number>
  readonly selected: boolean
}

export const isFullDateCardConfig = (
  c: DateCardConfig
): c is FullDateCardConfig => c.kind === DateCardKind.FULL

export const dateCardForDayOfMonth = (
  month: number,
  dayOfMonth: number,
  baseCapacity: number,
  savedTimes: ReadonlyMap<number, number>,
  reservationsByTime: ReadonlyMap<number, number>,
  selected?: boolean
): FullDateCardConfig => ({
  kind: DateCardKind.FULL,
  key: Symbol(),
  month,
  baseCapacity,
  savedTimes,
  reservationsByTime,
  selectedTimes: new Set(),
  dayOfMonth,
  selected: selected ?? false
})

export const toggleSelected = (c: FullDateCardConfig): FullDateCardConfig => ({
  ...c,
  selected: !c.selected
})

export type DateCardConfig =
  | EmptyDateCardConfig
  | FullDateCardConfig
  | PastDateCardConfig
