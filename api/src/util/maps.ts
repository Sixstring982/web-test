/**
 * Given a list of elements, turns it into a Map. Keys of the map are generated 
 * by applying `keyFn` to each element, and the correspoinding value is
 * generated by applying `valueFn`.
 */
export const buildMap = <T, K, V>(
  element: readonly T[],
  keyFn: (t: T) => K,
  valueFn: (t: T) => V
): ReadonlyMap<K, V> => new Map(element.map(v => [keyFn(v), valueFn(v)]))
