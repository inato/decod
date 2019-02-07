import { ArrayDecoderError } from "./ArrayDecoderError";
import { AtDecoderError } from "./AtDecoderError";
import { EitherDecoderError } from "./EitherDecoderError";
import { ScalarDecoderError } from "./ScalarDecoderError";
import { StrictDecoderError } from "./StrictDecoderError";

type TDecoder<T> = (input: unknown) => T;

/**
 * @description Try all the given decoders and return the result of the first one not raising an error
 * @param lDecoder the first decoder
 * @param rDecoder the second decoder
 */
export const either = <T1, T2>(
  lDecoder: TDecoder<T1>,
  rDecoder: TDecoder<T2>,
): TDecoder<T1 | T2> => (input: unknown) => {
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
export const string: TDecoder<string> = (input: unknown) => {
  if (typeof input === "string") {
    return input;
  }
  throw new ScalarDecoderError("string", input);
};

/**
 * @description decode an unknown value as a string
 * @param input an unknown value
 */
export const is = <T>(expectedValue: T): TDecoder<T> => (input: unknown) => {
  if (input === expectedValue) {
    return input as any;
  }
  throw new StrictDecoderError(expectedValue, input);
};

/**
 * @description decode an unknown value as a number
 * @param input an unknown value
 */
export const number: TDecoder<number> = (input: unknown) => {
  if (typeof input === "number") {
    return input;
  }
  throw new ScalarDecoderError("number", input);
};

/**
 * @description decode an unknown value as null
 * @param input an unknown value
 */
export const null_: TDecoder<null> = (input: unknown) => {
  if (input === null) {
    return input as null;
  }
  throw new ScalarDecoderError("null", input);
};

/**
 * @description decode an unknown value as undefined
 * @param input an unknown value
 */
export const undefined_: TDecoder<undefined> = (input: unknown) => {
  if (typeof input === "undefined") {
    return input;
  }
  throw new ScalarDecoderError("undefined", input);
};

/**
 * @description decode an unknown value as T, undefined or null
 * @param input an unknown value
 */
export const optional = <T>(decoder: TDecoder<T>) =>
  either(decoder, either(null_, undefined_));

/**
 * @description decode an unknown value as T or null
 * @param input an unknown value
 */
export const nullable = <T>(decoder: TDecoder<T>) => either(decoder, null_);

/**
 * @description decode an unknown value as boolean
 * @param input an unknown value
 */
export const boolean: TDecoder<boolean> = (input: unknown) => {
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
  decoder: TDecoder<T>,
): TDecoder<T> => (input: unknown) => {
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
export const array = <T>(decoder: TDecoder<T>): TDecoder<T[]> => (
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
export function try_<T>(decoder: TDecoder<T>): TDecoder<T | undefined>;
export function try_<T>(decoder: TDecoder<T>, defaultValue: T): TDecoder<T>;
export function try_<T>(decoder: TDecoder<T>, defaultValue?: any): TDecoder<T> {
  return either(decoder, _ => defaultValue);
}

export const attempt = try_;

export const assoc = <K, V>(
  keyDecoder: TDecoder<K>,
  valueDecoder: TDecoder<V>,
) => (input: unknown) =>
  Object.keys(input as any).map(key => ({
    key: keyDecoder(key),
    value: valueDecoder((input as any)[key]),
  }));
