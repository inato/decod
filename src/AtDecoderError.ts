import { DecoderError } from "./DecoderError";
export class AtDecoderError extends DecoderError {
  public name = "AtDecoderError";
  constructor(public path: string | number, public error: Error) {
    super(`at path: "${path}"\n\t${error}`);
  }
}
