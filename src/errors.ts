export class DecoderError extends Error {
  public name = "DecoderError";
}

export class OneOfDecoderError extends DecoderError {
  public name = "OneOfDecoderError";
  constructor(errors: Error[]) {
    super(
      `all decoders failed\n\t${errors.map(error => `${error}`).join("\n\t")}`,
    );
  }
}

export class AtDecoderError extends DecoderError {
  public name = "AtDecoderError";
  constructor(public path: string | number, err: Error) {
    super(`at path: "${path}"\n\t${err}`);
  }
}

export class ArrayDecoderError extends DecoderError {
  public name = "ArrayDecoderError";
  constructor(public index: number, err: Error) {
    super(`at index: "${index}"\n\t${err}`);
  }
}

export class PropsDecoderError extends DecoderError {
  public name = "PropsDecoderError";
  constructor(public key: string, err: Error) {
    super(`at key: "${key}"\n\t${err}`);
  }
}

export class ScalarDecoderError extends DecoderError {
  public name = "ScalarDecoderError";
  constructor(public expectedType: string, public value: unknown) {
    super(
      `expected type: "${expectedType}" but got type: "${typeof value}" for value: "${value}"`,
    );
  }
}

export class StrictDecoderError extends DecoderError {
  public name = "StrictDecoderError";
  constructor(public expectedValue: unknown, public value: unknown) {
    super(
      `expected value: "${expectedValue}" of type: "${typeof expectedValue}" but got value: "${value}" of type: "${typeof value}"`,
    );
  }
}
