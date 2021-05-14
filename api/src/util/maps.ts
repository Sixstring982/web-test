export const buildMap = <T, K, V>(
  values: readonly T[],
  keyFn: (t: T) => K,
  valueFn: (t: T) => V
): ReadonlyMap<K, V> => new Map(values.map(v => [keyFn(v), valueFn(v)]))
