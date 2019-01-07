import { DecoderError } from "./DecoderError";
export class ScalarDecoderError extends DecoderError {
  public name = "ScalarDecoderError";
  constructor(public expectedType: string, public value: unknown) {
    super(
      `expected type: "${expectedType}" but got type: "${typeof value}" for value: "${value}"`,
    );
  }
}
