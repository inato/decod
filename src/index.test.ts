import * as decod from "./";

describe("Decod", () => {
  it("Should decode strings", () => {
    expect(() => decod.str("Hello")).not.toThrowError();
    expect(() => decod.str(12)).toThrowError();
    expect(decod.str("Hello")).toEqual("Hello");
  });

  it("Should decode numbers", () => {
    expect(() => decod.nbr(12)).not.toThrowError();
    expect(() => decod.nbr("12")).toThrowError();
    expect(decod.nbr(12)).toEqual(12);
  });

  it("Should decode booleans", () => {
    expect(() => decod.bool(false)).not.toThrowError();
    expect(() => decod.bool("32")).toThrowError();
    expect(decod.bool(false)).toEqual(false);
  });

  it("Should decode nulls", () => {
    expect(() => decod.nul(null)).not.toThrowError();
    expect(() => decod.nul("32")).toThrowError();
    expect(decod.nul(null)).toEqual(null);
  });

  it("Should decode undefined", () => {
    expect(() => decod.undef(undefined)).not.toThrowError();
    expect(() => decod.undef("32")).toThrowError();
    expect(decod.undef(undefined)).toEqual(undefined);
  });

  it("Should decode objects", () => {
    expect(() =>
      decod.at(["a", "b", 1, 2], decod.str)({ a: { b: { 1: { 2: "" } } } }),
    ).not.toThrowError();
    expect(() => decod.at(["a"], decod.str)("")).toThrowError();
    expect(decod.at(["a"], decod.str)({ a: "Hello" })).toEqual("Hello");
  });

  it("Should decode either things", () => {
    expect(() =>
      decod.either([decod.str, decod.bool])(true),
    ).not.toThrowError();
    expect(() => decod.either([decod.str, decod.bool])(32)).toThrowError();
    expect(decod.either([decod.str, decod.bool])(true)).toEqual(true);
  });
});
