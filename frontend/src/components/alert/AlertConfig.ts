export enum AlertKind {
  INFO,
  WARNING,
  ERROR
}

export interface AlertConfig {
  readonly kind: AlertKind
  readonly message: string
}

export const infoAlert = (message: string) => ({
  kind: AlertKind.INFO,
  message
})

export const warningAlert = (message: string) => ({
  kind: AlertKind.WARNING,
  message
})

export const errorAlert = (message: string) => ({
  kind: AlertKind.ERROR,
  message
})
