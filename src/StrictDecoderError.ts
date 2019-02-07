import { DecoderError } from "./DecoderError";
export class StrictDecoderError extends DecoderError {
  public name = "StrictDecoderError";
  constructor(public expectedValue: unknown, public value: unknown) {
    super(
      `expected value: "${expectedValue}" of type: "${typeof expectedValue}" but got value: "${value}" of type: "${typeof value}"`,
    );
  }
}
