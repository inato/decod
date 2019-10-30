import {
  ArrayDecoderError,
  AtDecoderError,
  OneOfDecoderError,
  PropsDecoderError,
  ScalarDecoderError,
  StrictDecoderError,
} from "./errors";

export type Decoder<T> = (input: unknown) => T;

/**
 * Try all the given decoders and return the result of the first one not raising an error.
 * If none succeed, throws a {@link OneOfDecoderError}
 *
 * For example, this is how nullable is defined:
 * ```ts
 * const nullable = <T>(decoder: Decoder<T>) => decod.oneOf(decoder, decod.null_);
 * ```
 *
 * @category Decoder combinators
 */
// prettier-ignore
export function oneOf<D1>(d1: Decoder<D1>): Decoder<D1>;
// prettier-ignore
export function oneOf<D1, D2>(d1: Decoder<D1>, d2: Decoder<D2>): Decoder<D1 | D2>;
// prettier-ignore
export function oneOf<D1, D2, D3>(d1: Decoder<D1>, d2: Decoder<D2>, d3: Decoder<D3>): Decoder<D1 | D2 | D3>;
// prettier-ignore
export function oneOf<D1, D2, D3, D4>(d1: Decoder<D1>, d2: Decoder<D2>, d3: Decoder<D3>, d4: Decoder<D4>): Decoder<D1 | D2 | D3 | D4>;
// prettier-ignore
export function oneOf<D1, D2, D3, D4, D5>(d1: Decoder<D1>, d2: Decoder<D2>, d3: Decoder<D3>, d4: Decoder<D4>, d5: Decoder<D5>): Decoder<D1 | D2 | D3 | D4 | D5>;
// prettier-ignore
export function oneOf<D1, D2, D3, D4, D5, D6>(d1: Decoder<D1>, d2: Decoder<D2>, d3: Decoder<D3>, d4: Decoder<D4>, d5: Decoder<D5>, d6: Decoder<D6>): Decoder<D1 | D2 | D3 | D4 | D5 | D6>;
// prettier-ignore
export function oneOf<D1, D2, D3, D4, D5, D6, D7>(d1: Decoder<D1>, d2: Decoder<D2>, d3: Decoder<D3>, d4: Decoder<D4>, d5: Decoder<D5>, d6: Decoder<D6>, d7: Decoder<D7>): Decoder<D1 | D2 | D3 | D4 | D5 | D6 | D7>;
// prettier-ignore
export function oneOf<D1, D2, D3, D4, D5, D6, D7, D8>(d1: Decoder<D1>, d2: Decoder<D2>, d3: Decoder<D3>, d4: Decoder<D4>, d5: Decoder<D5>, d6: Decoder<D6>, d7: Decoder<D7>, d8: Decoder<D8>): Decoder<D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8>;
// prettier-ignore
export function oneOf<D1, D2, D3, D4, D5, D6, D7, D8, D9>(d1: Decoder<D1>, d2: Decoder<D2>, d3: Decoder<D3>, d4: Decoder<D4>, d5: Decoder<D5>, d6: Decoder<D6>, d7: Decoder<D7>, d8: Decoder<D8>, d9: Decoder<D9>): Decoder<D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9>;
export function oneOf<T>(...decoders: Array<Decoder<T>>) {
  return (input: unknown) => {
    const errors: Error[] = [];
    for (const decoder of decoders) {
      try {
        return decoder(input);
      } catch (e) {
        errors.push(e);
      }
    }
    throw new OneOfDecoderError(errors);
  };
}

/**
 * Decode an `unknown` value as a `string`.
 * Otherwise, throws a {@link ScalarDecoderError}.
 *
 * @category Primitive decoders
 */
export const string: Decoder<string> = (input: unknown) => {
  if (typeof input === "string") {
    return input;
  }
  throw new ScalarDecoderError("string", input);
};

/**
 * Decode an `unknown` value if it matches the expected value.
 * Otherwise, throws a {@link ScalarDecoderError}.
 *
 * It is mostly intended to be used in conjunction with {@link oneOf} for decoding groups of specific values.
 *
 * ```ts
 * const droidDecoder = decod.oneOf(
 *   decod.is('r2d2'),
 *   decod.is('c3po')
 * );
 * ```
 *
 * @category Primitive decoders
 */
export const is = <T extends string | number | boolean | null | undefined>(
  expectedValue: T,
): Decoder<T> => (input: unknown) => {
  if (input === expectedValue) {
    return expectedValue;
  }
  throw new StrictDecoderError(expectedValue, input);
};

/**
 * Decode an `unknown` value as a `number`.
 * Otherwise, throws a {@link ScalarDecoderError}.
 *
 * @category Primitive decoders
 */
export const number: Decoder<number> = (input: unknown) => {
  if (typeof input === "number") {
    return input;
  }
  throw new ScalarDecoderError("number", input);
};

/**
 * Decode an `unknown` value as a `null` value.
 * Otherwise, throws a {@link ScalarDecoderError}.
 *
 * @category Primitive decoders
 */
export const null_: Decoder<null> = (input: unknown) => {
  if (input === null) {
    return input as null;
  }
  throw new ScalarDecoderError("null", input);
};

/**
 * Decode an `unknown` value as `undefined`.
 * Otherwise, throws a {@link ScalarDecoderError}.
 *
 * @category Primitive decoders
 */
export const undefined_: Decoder<undefined> = (input: unknown) => {
  if (typeof input === "undefined") {
    return input;
  }
  throw new ScalarDecoderError("undefined", input);
};

/**
 * Transform a `Decoder<T>` into a `Decoder<T | null | undefined>`.
 *
 * @category Decoder combinators
 */
export const optional = <T>(decoder: Decoder<T>) =>
  oneOf(decoder, null_, undefined_);

/**
 * Transform a `Decoder<T>` into a `Decoder<T | null>`.
 *
 * @category Decoder combinators
 */
export const nullable = <T>(decoder: Decoder<T>) => oneOf(decoder, null_);

/**
 * Decode an `unknown` value as a `boolean`.
 * Otherwise, throws a {@link ScalarDecoderError}.
 *
 * @category Primitive decoders
 */
export const boolean: Decoder<boolean> = (input: unknown) => {
  if (typeof input === "boolean") {
    return input;
  }
  throw new ScalarDecoderError("boolean", input);
};

/**
 * Decode an `unknown` value as a `Date`.
 * Otherwise, throws a {@link ScalarDecoderError}.
 *
 * @category Primitive decoders
 */
export const date: Decoder<Date> = (input: unknown) => {
  if (input instanceof Date) {
    return input;
  }
  throw new ScalarDecoderError("Date", input);
};

/**
 * Apply the provided decoder at the specified path in a complex object.
 * Path can be either:
 * - a `string` (when querying a top level field)
 * - a `number` (when querying an array index)
 * - an `Array<string | number>` (to query an arbitrarily nested field)
 *
 * @category Decoder combinators
 */
export const at = <T>(
  path: Array<string | number> | string | number,
  decoder: Decoder<T>,
): Decoder<T> => (input: unknown) => {
  try {
    if (typeof path === "string" || typeof path === "number") {
      return decoder((input as any)[path]);
    }

    if (path.length) {
      return at(path.slice(1), decoder)((input as any)[path[0]]);
    }
  } catch (e) {
    if (typeof path === "string" || typeof path === "number") {
      throw new AtDecoderError(path, e);
    }

    throw new AtDecoderError(path[0], e);
  }

  return decoder(input);
};

/**
 * Transform a `Decoder<T>` into a `Decoder<Array<T>>`.
 *
 * @category Decoder combinators
 */
export const array = <T>(decoder: Decoder<T>): Decoder<T[]> => (
  input: unknown,
): T[] => {
  if (Array.isArray(input)) {
    return input.map((value, index) => {
      try {
        return decoder(value);
      } catch (e) {
        throw new ArrayDecoderError(index, e);
      }
    });
  }
  throw new ScalarDecoderError("array", input);
};

/**
 * Try a decoder, and fallback to a specified value (if provided) if the decoder fails.
 * If no default value is specified, fallback to `undefined`.
 *
 * @category Decoder combinators
 */
export function try_<T>(decoder: Decoder<T>): Decoder<T | undefined>;
export function try_<T>(decoder: Decoder<T>, defaultValue: T): Decoder<T>;
export function try_<T>(decoder: Decoder<T>, defaultValue?: any): Decoder<T> {
  return oneOf(decoder, (_: unknown) => defaultValue);
}

/**
 * Synonym for {@link try_}
 *
 * @category Decoder combinators
 */
export const attempt = try_;

/**
 * Create a decoder for arbitrary key/value pairs from a key decoder and a value decoder.
 * Effectively transforms a `Decoder<K>` and a `Decoder<V>` into a `Decoder<Array<{ key: K, value: V }>>`.
 *
 * @category Decoder combinators
 */
export const assoc = <K, V, T extends { [key: string]: unknown }>(
  keyDecoder: Decoder<K>,
  valueDecoder: Decoder<V>,
) => (input: T) =>
  Object.keys(input).map(key => ({
    key: keyDecoder(key),
    value: valueDecoder(input[key]),
  }));

/**
 * Create a decoder for some complex structure from an object where each value is a `Decoder` and the keys
 * correspond to the desired output structure.
 *
 * ```ts
 * const personDecoder = decod.props({
 *   first_name: decod.at('first_name', decod.string),
 *   last_name: decod.at('last_name', decod.string),
 *   age: decod.at('age', decod.number),
 * });
 * ```
 *
 * @category Decoder combinators
 */
export const props = <T extends { [key: string]: Decoder<any> }>(obj: T) => (
  input: unknown,
): { [P in keyof T]: ReturnType<T[P]> } =>
  Object.keys(obj).reduce(
    (acc, key) => {
      try {
        const decoded = obj[key](input);

        return { ...acc, [key]: decoded };
      } catch (e) {
        throw new PropsDecoderError(key, e);
      }
    },
    {} as { [P in keyof T]: ReturnType<T[P]> },
  );
