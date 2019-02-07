import * as decod from "./";

describe("Decod", () => {
  it("Should decode strings", () => {
    expect(() => decod.string("Hello")).not.toThrowError();
    expect(() => decod.string(12)).toThrowError(
      `expected type: "string" but got type: "number" for value: "12"`,
    );
    expect(decod.string("Hello")).toEqual("Hello");
  });

  it("Should decode strict values", () => {
    expect(() => decod.is("Hello")("Hello")).not.toThrowError();
    expect(() => decod.is(12)("12")).toThrowError(
      `expected value: "12" of type: "number" but got value: "12" of type: "string"`,
    );
    expect(decod.is("Hello")("Hello")).toEqual("Hello");
  });

  it("Should decode numbers", () => {
    expect(() => decod.number(12)).not.toThrowError();
    expect(() => decod.number("12")).toThrowError(
      `expected type: "number" but got type: "string" for value: "12"`,
    );
    expect(decod.number(12)).toEqual(12);
  });

  it("Should decode booleans", () => {
    expect(() => decod.boolean(false)).not.toThrowError();
    expect(() => decod.boolean("32")).toThrowError(
      `expected type: "boolean" but got type: "string" for value: "32"`,
    );
    expect(decod.boolean(false)).toEqual(false);
  });

  it("Should decode nulls", () => {
    expect(() => decod.null_(null)).not.toThrowError();
    expect(() => decod.null_("32")).toThrowError(
      `expected type: "null" but got type: "string" for value: "32"`,
    );
    expect(decod.null_(null)).toEqual(null);
  });

  it("Should decode nullables", () => {
    expect(() => decod.nullable(decod.string)(null)).not.toThrowError();
    expect(() => decod.nullable(decod.string)("null")).not.toThrowError();
    expect(() => decod.nullable(decod.string)(32)).toThrowError(
      `decoders both failed\n\tleft: ScalarDecoderError: expected type: "string" but got type: "number" for value: "32"\n\tright: ScalarDecoderError: expected type: "null" but got type: "number" for value: "32"`,
    );
    expect(decod.nullable(decod.string)("null")).toBe("null");
    expect(decod.nullable(decod.string)(null)).toBe(null);
  });

  it("Should decode optionals", () => {
    expect(() => decod.optional(decod.string)(null)).not.toThrowError();
    expect(() => decod.optional(decod.string)("null")).not.toThrowError();
    expect(() => decod.optional(decod.string)(32)).toThrowError(
      `decoders both failed\n\tleft: ScalarDecoderError: expected type: \"string\" but got type: \"number\" for value: \"32\"\n\tright: EitherDecoderError: decoders both failed\n\tleft: ScalarDecoderError: expected type: \"null\" but got type: \"number\" for value: \"32\"\n\tright: ScalarDecoderError: expected type: \"undefined\" but got type: \"number\" for value: \"32\"`,
    );
    expect(decod.optional(decod.string)("null")).toBe("null");
    expect(decod.optional(decod.string)(null)).toBe(null);
    expect(decod.optional(decod.string)(undefined)).toBe(undefined);
  });

  it("Should decode undefined", () => {
    expect(() => decod.undefined_(undefined)).not.toThrowError();
    expect(() => decod.undefined_("32")).toThrowError(
      `expected type: "undefined" but got type: "string" for value: "32"`,
    );
    expect(decod.undefined_(undefined)).toEqual(undefined);
  });

  it("Should try to decode", () => {
    expect(() => decod.try_(decod.string)("32")).not.toThrowError();
    expect(() => decod.try_(decod.string)(32)).not.toThrowError();
    expect(decod.try_(decod.string)("32")).toEqual("32");
  });

  it("Should decode assoc", () => {
    const decoder = decod.assoc(
      decod.string,
      decod.either(decod.string, decod.number),
    );
    expect(() => decoder({ a: "b" })).not.toThrowError();
    expect(decoder({ a: "one", b: 1 })).toEqual([
      {
        key: "a",
        value: "one",
      },
      {
        key: "b",
        value: 1,
      },
    ]);
  });

  it("Should decode objects", () => {
    expect(() =>
      decod.at(["a", "b", 1, 2], decod.string)({ a: { b: { 1: { 2: "" } } } }),
    ).not.toThrowError();
    expect(() => decod.at(["a"], decod.string)("")).toThrowError(
      `at path: "a"\n\tScalarDecoderError: expected type: "string" but got type: "undefined" for value: "undefined"`,
    );
    expect(decod.at(["a"], decod.string)({ a: "Hello" })).toEqual("Hello");
  });

  it("Should decode arrays", () => {
    expect(() =>
      decod.array(decod.string)(["toto", "titi", "tata"]),
    ).not.toThrowError();
    expect(() => decod.array(decod.string)([32, 32, 12])).toThrowError(
      `at index: "0"\n\tScalarDecoderError: expected type: "string" but got type: "number" for value: "32"`,
    );
    expect(() => decod.array(decod.string)("Hello")).toThrowError(
      `expected type: "array" but got type: "string" for value: "Hello"`,
    );
    expect(decod.array(decod.string)(["toto", "titi", "tata"])).toEqual([
      "toto",
      "titi",
      "tata",
    ]);
  });

  it("Should decode either things", () => {
    expect(() =>
      decod.either(decod.string, decod.boolean)(true),
    ).not.toThrowError();
    expect(() => decod.either(decod.string, decod.boolean)(32)).toThrowError(
      `decoders both failed\n\tleft: ScalarDecoderError: expected type: "string" but got type: "number" for value: "32"\n\tright: ScalarDecoderError: expected type: "boolean" but got type: "number" for value: "32"`,
    );
    expect(decod.either(decod.string, decod.boolean)(true)).toEqual(true);
  });
});
