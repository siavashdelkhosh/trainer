import * as t from "io-ts";

export function withDefault<T extends t.Any>(
  type: t.TypeOf<T>,
  defaultValue: t.TypeOf<T>
): t.Type<any, t.TypeOf<T>> {
  return new t.Type(
    type.name,
    (value): value is T => type.is(value),
    (value, context) =>
      type.validate(
        value !== undefined && value !== null ? value : defaultValue,
        context
      ),
    (value) => type.encode(value)
  );
}
