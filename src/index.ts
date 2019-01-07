type decoder<T> = (input: unknown) => T;

/**
 * @description Try all the given decoders and return the result of the first one not raising an error
 * @param decoders a list of decoder
 */
export const either = <T1, T2>(
  decoders: [decoder<T1>, decoder<T2>],
): decoder<T1 | T2> => (input: unknown) => {
  for (const decodr of decoders) {
    try {
      return decodr(input);
    } catch {
      continue;
    }
  }
  throw new Error("Tried all given decoders but no one succeed");
};

export const str: decoder<string> = (input: unknown) => {
  if (typeof input === "string") {
    return input;
  }
  throw new Error("Expected string");
};

export const nbr: decoder<number> = (input: unknown) => {
  if (typeof input === "number") {
    return input;
  }
  throw new Error("Expected number");
};

export const nul: decoder<null> = (input: unknown) => {
  if (input === null) {
    return input as null;
  }
  throw new Error("Expected null");
};

export const undef: decoder<undefined> = (input: unknown) => {
  if (typeof input === "undefined") {
    return input;
  }
  throw new Error("Expected undefined");
};

export const bool: decoder<boolean> = (input: unknown) => {
  if (typeof input === "boolean") {
    return input;
  }
  throw new Error("Expected boolean");
};

export const at = <T>(
  path: Array<string | number>,
  decodr: decoder<T>,
): decoder<T> => (input: unknown) =>
  decodr(path.reduce((val: any, pth) => val[pth], input));
