/** Creates an array of length `times` with the same `value` in each position. */
export const repeat = (value: number, times: number): readonly number[] =>
  new Array(times).fill(value)

export const buildArray = <T>(length: number, valueFn: (index: number) => T): readonly T[] =>
  new Array(length).fill(undefined).map((_, index) => valueFn(index))
