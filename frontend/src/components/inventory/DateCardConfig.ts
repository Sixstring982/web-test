export enum DateCardKind {
  EMPTY,
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

export interface FullDateCardConfig {
  readonly kind: DateCardKind.FULL
  readonly key: symbol
  readonly dayOfMonth: number
  readonly selected: boolean
}

export const dateCardForDayOfMonth = (
  dayOfMonth: number
): FullDateCardConfig => ({
  kind: DateCardKind.FULL,
  key: Symbol(),
  dayOfMonth,
  selected: false
})

export const toggleSelected = (c: FullDateCardConfig): FullDateCardConfig => ({
  ...c,
  selected: !c.selected
})

export type DateCardConfig = EmptyDateCardConfig | FullDateCardConfig
