# decod

Decode `unknown` values into well-typed Typescript ones.

## What

This is heavily inspired by bs-json, a Bucklescript module to decode JSON values and will provide you type-safe with low overhead input validation and typing by using the recently added `unknown` type.

## Why

Typescript is great since you can add lightweight static typing to your node.js or web application.
If you follow strict guidelines you should be able to crush runtime exceptions down to 0.

A common problem is that you often work with external services exchanging JSON and you might be tempted to statically cast those arbitrary JSON values from the outer world from `any` to an interface definition of your choice.
Great! But what happens when this input, for whatever reason, differs slightly from the expected payload?

- The best case scenario would probably be a quick crash, but then it will be painful the read the error stacktrace to pinpoint exactly what went wrong.
- But in the worst case, and I bet this might have already happened to you, you insert inconsistent data into your database.

## How

Leveraging the power of Typescript and the `unknown` type, it is possible to validate and strongly type any uncertain value, at the same time!

Let say you call a third party REST API

### Before

```ts
export interface IResult {
  id: string;
  user: IUser;
}

export interface IUser {
  firstName: string;
  comments: string[];
  email: string | null;
  age?: number;
  isCool: boolean;
}

const result: IResult = await get("https://cool.com/api");
```

Great, you typed your input reading the API doc, but what happens when the API slightly change, or if the developer made an error describing their APIs?

### After

```ts
import * as decod from "decod";

const userDecoder = decod.props({
  firstName: decod.at("firstName", decod.string),
  comments: decod.at("comments", decod.array(decod.string)),
  email: decod.at("email", decod.nullable(decod.string)),
  age: decod.at("age", decod.optional(decod.number)),
  isCool: decod.at("isCool", decod.bool),
});

const resultDecoder = decod.props({
  id: decod.at("id", decod.string),
  user: decod.at("user", userDecoder),
});

export type TResult = ReturnType<typeof resultDecoder>;

const result = resultDecoder(await get("https://cool.com/api"));
```

## API

### Primitive decoders

The most basic blocks of decod are the primitive decoders. These just basically assert that the type of the `unknown` input you provide them is what you expect. If it is, you end up with your initial input value except now, as far as the typescript compiler is concerned, it's well-typed and not `unknown` anymore. If it fails though, it will throw a `ScalarDecoderError` (or a `StrictDecoderError` for `decod.is`) with nice information on the type (or value) you expected and the actual value you tried to decode.

- `decod.number`
- `decod.string`
- `decod.boolean`
- `decod.null_`
- `decod.undefined_`
- `decod.date`
- `decod.is`

Among those, `decod.is` is kinda special in that it checks that the input value not only matches the type you expect but also its actual value. Not that in order to do that, it only accepts values of primitive types (`string`, `number`, `boolean`, `null` or `undefined`) otherwise it would need to perform deep equality in case of complex objects or arrays.

It's most often used in conjunction with `decod.oneOf` to decode string enums for example:

```ts
type Droid = "r2d2" | "c3po";
const droidDecoder = decod.oneOf(decod.is("r2d2"), decod.is("c3po"));
```

Be careful, although in this case `droidDecoder` will fail if its input is anything other than `r2d2` or `c3po`, typescript won't consider the result to be as strictly typed as you might want. If you want the typescript compiler to infer that `droidDecoder` should have the type `Decoder<Droid>` instead of simply `Decoder<string>`, you have to either explicitly write that declaration or mark the arguments to `decode.is` with `as const`.

```ts
// Explicit typing
const droidDecoder: Decoder<Droid> = decod.oneOf(
  decod.is("r2d2"),
  decod.is("c3po"),
);

// `as const` declarations
const droidDecoder = decod.oneOf(
  decod.is("r2d2" as const),
  decod.is("c3po" as const),
);
```

### Decoder combinators

Decoding primitive values is nice and all but it's pretty rare to want to decode some JSON that's just one scalar value. Thankfully, decod provides some nice combinators that allows you to build more complex decoders. We'll go into some more details about each of those.

#### `decod.oneOf`

We've already seen an example of `decod.oneOf`. It's behaviour is pretty straightforward, it just takes as arguments an arbitrary number of decoders (primitive or compound ones), trys them all in order and stops at the first one that succeeds. If none of them does, it throws a `OneOfDecoderError`.
For example, primitive decoders are strict, meaning they don't allow `null` or `undefined` values. `decod.oneOf` lets us define nullable decoders from primitive ones. In fact, that is exactly how `decod.nullable` is implemented! There is no magic to it.

```ts
const nullable = (decoder: Decoder<T>) => decod.oneOf(decoder, decod.null_);
const nullableString = nullable(decod.string);
```

#### `decod.nullable` and `decod.optional`

Just like we saw, decod already provides for you `decod.nullable` that will transform any `Decoder<T>` into a `Decoder<T | null>`. It also provides `decod.optional` that transforms a `Decoder<T>` into a `Decoder<T | null | undefined>`.

#### `decod.array`

Another useful decoder transformer is `decod.array` that will transform a `Decoder<T>` into a `Decoder<Array<T>>`.

#### `decod.attempt` and `decod.try_`

Sometimes, you just want to try to decode something, but if it fails for some reason, have it recover with a default value. That's what `decod.try_` and `decod.attempt` do (they really are just synonyms of each other).
They accept any decoder for a type `T` alongside an optional default value of type `T`. If the decoder fails the input will decode to either `undefined` (if no default value is provided) or the provided default value instead of throwing.

```ts
const lenientStringDecoder = decod.attempt(decod.string);
const lenientStringDecoderWithDefault = decod.try_(decod.string, "");
```

#### `decod.assoc`

When you want to decode some JSON with dynamically generated keys, you might not know in advance which of those keys you're interested in. For those cases, `decod.assoc` takes two decoders, one for the keys (`Decoder<K>`) and one for the values (`Decoder<V>`) and returns a structure containing those key/value pairs `Decoder<Array<{ key: K, value: V }>>`.

```ts
const dynamicJSON = `{
  "key1": 42,
  "key2": 1337,
  "key128": 0
}`;

const kvDecoder = decod.assoc(decod.string, decod.number);
const kvs = kvDecoder(JSON.parse(dynamicJSON));
// => kvs will have value:
//    [
//      { key: 'key1', value: 42 },
//      { key: 'key2', value: 1337 },
//      { key: 'key128', value: 0 }
//    ]
```

#### `decod.at`

JSON is an inherently hierarchical data format. Most of the time, you'll want to decode a specific field into some well-typed value. And sometimes, that field will be arbitrarily nested in the hierarchy. That's precisely what `decod.at` will help you with. It can take various kind of arguments:

- a `string` in case you want to access a top level field
- a `number` for when you want to index a specific value from a JSON array
- an `Array<string | number>` when you search for a deeply nested field

```ts
const someJSON = `{
  "movie": "Star Wars",
  "director": {
    "first_name": "George",
    "last_name": "Lucas"
  },
  "droids": [
    "r2d2",
    "c3po"
  ]
}`;

// Top level field
const movieDecoder = decod.at("movie", decod.string);

// Nested Field
const directorLastNameDecoder = decod.at(
  ["director", "last_name"],
  decod.string,
);

// Array index
const r2d2Decoder = decod.at(["droids", 0], decod.is("r2d2" as const));

const movie = movieDecoder(JSON.parse(someJSON));
const directorLastName = directorLastNameDecoder(JSON.parse(someJSON));
const r2d2 = r2d2Decoder(JSON.parse(someJSON));
```

#### `decod.props`

This is, hands down, the most useful combinator of all. That's why it is the one showcased in the overview at the top of this documentation.
`decod.props` will let you declare the structure you want to decode into, associating each field with the decoder for that field.

Let's say you want to decode the JSON structure shown above into the following interface:

```ts
type Droid = "r2d2" | "c3po";

interface StarWars {
  movie: string;
  director: string;
  droids?: Array<Droid>;
}
```

This is how you would do it, using `decod.props`:

```ts
const droidDecoder = decod.oneOf(
  decod.is("r2d2" as const),
  decod.is("c3po" as const),
);

const directorDecoder = (input: unknown) => {
  const firstName = decod.at("first_name", decod.string);
  const lastName = decod.at("last_name", decod.string);

  return `${firstName} ${lastName}`;
};

const starWarsDecoder = decod.props({
  movie: decod.at("movie", decod.string),
  director: decod.at("director", directorDecoder),
  droids: decod.at("droid", decod.array(droidDecoder)),
});
```

See what we did here? We even created our own custom compound decoder in `directorDecoder`! Remember that a `Decoder<T>` is really just an alias for a function type `(input: unknown) => T`.
As long as you respect that contract, you can use any of your own functions from `unknown` to any arbitrary `T` as decoders in your combinators.

_Please note that this is just a toy example. In a real life application, you would want to catch any exception in your custom decoder to either recover from it or throw a more meaningfull error that will help you identify failures down the line._
