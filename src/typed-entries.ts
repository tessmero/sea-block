/**
 * @file typed-entries.ts
 *
 * Boilerplate helper that wraps Object.entries and maintains key and value types.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function typedEntries<T extends {}>(object: T): ReadonlyArray<Entry<T>> {
  return Object.entries(object) as unknown as ReadonlyArray<Entry<T>>
}

type TupleEntry<T extends ReadonlyArray<unknown>, I extends Array<unknown> = [], R = never>
  = T extends readonly [infer Head, ...infer Tail]
    ? TupleEntry<Tail, [...I, unknown], R | [`${I['length']}`, Head]>
    : R

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ObjectEntry<T extends {}>
  = T extends object
    ? { [K in keyof T]: [K, Required<T>[K]] }[keyof T] extends infer E
        ? E extends [infer K, infer V]
          ? K extends string | number
            ? [`${K}`, V]
            : never
          : never
        : never
    : never

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Entry<T extends {}>
  = T extends readonly [unknown, ...Array<unknown>]
    ? TupleEntry<T>
    : T extends ReadonlyArray<infer U>
      ? [`${number}`, U]
      : ObjectEntry<T>
