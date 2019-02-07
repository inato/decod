import {
  ArrayDecoderError,
  AtDecoderError,
  EitherDecoderError,
  PropsDecoderError,
  ScalarDecoderError,
  StrictDecoderError,
} from "./errors";

type Decoder<T> = (input: unknown) => T;

/**
 * @description Try all the given decoders and return the result of the first one not raising an error
 * @param lDecoder the first decoder
 * @param rDecoder the second decoder
 */
export const either = <T1, T2>(
  lDecoder: Decoder<T1>,
  rDecoder: Decoder<T2>,
): Decoder<T1 | T2> => (input: unknown) => {
  try {
    return lDecoder(input);
  } catch (le) {
    try {
      return rDecoder(input);
    } catch (re) {
      throw new EitherDecoderError(le, re);
    }
  }
};

/**
 * @description decode an unknown value as a string
 * @param input an unknown value
 */
export const string: Decoder<string> = (input: unknown) => {
  if (typeof input === "string") {
    return input;
  }
  throw new ScalarDecoderError("string", input);
};

/**
 * @description decode an unknown value as a string
 * @param input an unknown value
 */
export const is = <T>(expectedValue: T): Decoder<T> => (input: unknown) => {
  if (input === expectedValue) {
    return input as any;
  }
  throw new StrictDecoderError(expectedValue, input);
};

/**
 * @description decode an unknown value as a number
 * @param input an unknown value
 */
export const number: Decoder<number> = (input: unknown) => {
  if (typeof input === "number") {
    return input;
  }
  throw new ScalarDecoderError("number", input);
};

/**
 * @description decode an unknown value as null
 * @param input an unknown value
 */
export const null_: Decoder<null> = (input: unknown) => {
  if (input === null) {
    return input as null;
  }
  throw new ScalarDecoderError("null", input);
};

/**
 * @description decode an unknown value as undefined
 * @param input an unknown value
 */
export const undefined_: Decoder<undefined> = (input: unknown) => {
  if (typeof input === "undefined") {
    return input;
  }
  throw new ScalarDecoderError("undefined", input);
};

/**
 * @description decode an unknown value as T, undefined or null
 * @param input an unknown value
 */
export const optional = <T>(decoder: Decoder<T>) =>
  either(decoder, either(null_, undefined_));

/**
 * @description decode an unknown value as T or null
 * @param input an unknown value
 */
export const nullable = <T>(decoder: Decoder<T>) => either(decoder, null_);

/**
 * @description decode an unknown value as boolean
 * @param input an unknown value
 */
export const boolean: Decoder<boolean> = (input: unknown) => {
  if (typeof input === "boolean") {
    return input;
  }
  throw new ScalarDecoderError("boolean", input);
};

/**
 * @description decode an unknown value an object path
 * @param path a string array
 * @param decoder a decoder
 */
export const at = <T>(
  path: Array<string | number> | string,
  decoder: Decoder<T>,
): Decoder<T> => (input: unknown) => {
  try {
    if (path.length) {
      return at(path.slice(1), decoder)((input as any)[path[0]]);
    }
  } catch (e) {
    throw new AtDecoderError(path[0], e);
  }
  return decoder(input);
};

/**
 * @description decode an unknown value an array
 * @param decoder a decoder
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
 * @description decode an unknown value an array
 * @param decoder a decoder
 */
export function try_<T>(decoder: Decoder<T>): Decoder<T | undefined>;
export function try_<T>(decoder: Decoder<T>, defaultValue: T): Decoder<T>;
export function try_<T>(decoder: Decoder<T>, defaultValue?: any): Decoder<T> {
  return either(decoder, _ => defaultValue);
}

export const attempt = try_;

export const assoc = <K, V, T extends { [key: string]: unknown }>(
  keyDecoder: Decoder<K>,
  valueDecoder: Decoder<V>,
) => (input: T) =>
  Object.keys(input).map(key => ({
    key: keyDecoder(key),
    value: valueDecoder(input[key]),
  }));

/**
 * @description a helper to decode objects
 * @param obj an object with decoders as values
 * @param input
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
