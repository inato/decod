import { DecoderError } from "./DecoderError";
export class ArrayDecoderError extends DecoderError {
  public name = "ArrayDecoderError";
  constructor(public index: number, public error: Error) {
    super(`at index: "${index}"\n\t${error}`);
  }
}
