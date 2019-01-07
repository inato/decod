# decod

Decode unknown values

## What

This is heavily inspired by bs-json, a Bucklescript module to decode json value and will provide you type safe with low overhead input validation and typing by using the recently added `unknown` type.

## Why

Typescript is great since you can add lightweight static typing to your node.js or web application.
If you follow strict guidelines you should be able to crush runtime exceptions by 0

A common problem is that you often work with external services exchanging JSON and you might be tempted to statically cast this `any` json to an interface definition of your choice, great, but, what happen when this input, for any reason slightly differ for the expected payload?

- The better case would probably be a quick crash, but then, it will be painful the read the error stacktrace to locate the error
- The worst, and I bet this already happen to you, you insert inconsistent data in your db

## How

Leveraging the power of typescript and the `unknown` type, it is possible to, at the same time, validate and strongly type any uncertain value !

Let say you call a third party REST API

### Before

```ts
export interface IResult {
  id: string;
  user: {
    firstName: string;
    comments: string[];
    email: string | null;
    age?: number;
    isCool: boolean;
  };
}

const result: IResult = await get("https://cool.com/api");
```

Great, you typed your input reading the API doc, but what append when the API slightly change, or if the developer made an error describing their APIs?

### After

```ts
import * as decod from "decod";

const decodeNullableString = decod.either(decod.string, decod.null_);
const decodeOptionalNumber = decod.either(decod.number, decod.undefined_);

const decodeUser = (input: unknown) => ({
  firstName: decod.at(["firstName"], decod.string)(input),
  comments: decod.at(["comments"], decod.array(decod.string))(input),
  email: decod.at(["email"], decodeNullableString)(input),
  age: decod.at(["age"], decodeOptionalNumber)(input),
  age: decod.at(["isCool"], decod.bool)(input),
});

const decodeResult = (input: unknown) => ({
  id: decod.at(["id"], decod.string)(input),
  user: decod.at(["user"], decodeUser)(input),
});

export type TResult = ReturnType<typeof decodeResult>;

const result = decodeResult(await get("https://cool.com/api"));
```
