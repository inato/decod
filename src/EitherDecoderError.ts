import { DecoderError } from "./DecoderError";
export class EitherDecoderError extends DecoderError {
  public name = "EitherDecoderError";
  constructor(public lError: Error, public rError: Error) {
    super(`decoders both failed\n\tleft: ${lError}\n\tright: ${rError}`);
  }
}
