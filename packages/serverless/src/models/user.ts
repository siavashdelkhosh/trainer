import * as t from "io-ts";
import { withDefault } from "./utils";
import { NonEmptyString } from "io-ts-types";

export const UserBase = t.intersection([
  t.type({
    email: t.string,
    password: t.string,
    email_verified: withDefault(t.boolean, false),
  }),
  t.partial({
    full_name: t.string,
  }),
]);

export type UserBaseType = Readonly<t.TypeOf<typeof UserBase>>;

export const UserRequest = t.exact(UserBase);

export type UserRequestType = Readonly<t.TypeOf<typeof UserRequest>>;

export const UserResponse = t.exact(
  t.intersection([
    UserBase,
    t.type({
      id: NonEmptyString,
      token: NonEmptyString,
    }),
  ])
);
