import * as t from "io-ts";

export const WorkoutTags = t.union([
  t.literal("gain_mussels"),
  t.literal("stress_relief"),
  t.literal("lose_weight"),
  t.literal("gain_weight"),
]);

export type WorkoutTagsType = Readonly<t.TypeOf<typeof WorkoutTags>>;

export const WorkoutBase = t.intersection([
  t.type({
    title: t.string,
    description: t.string,
    youtube_url: t.string,
  }),
  t.partial({
    tags: WorkoutTags,
  }),
]);

export type WorkoutBaseType = Readonly<t.TypeOf<typeof WorkoutBase>>;

export const WorkoutRequest = t.exact(WorkoutBase);

export type WorkoutRequestType = Readonly<t.TypeOf<typeof WorkoutRequest>>;

export const WorkoutResponse = t.exact(
  t.intersection([
    WorkoutBase,
    t.type({
      id: t.string,
    }),
  ])
);

export type WorkoutResponseType = Readonly<t.TypeOf<typeof WorkoutResponse>>;
