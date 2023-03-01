import * as t from "io-ts";

export const TrainingPlanBase = t.intersection([
  t.type({
    plan_type: t.string,
    user_id: t.string,
    plan_details: t.string,
  }),
  t.partial({
    status: t.string,
  }),
]);

export type TrainingPlanBaseType = Readonly<t.TypeOf<typeof TrainingPlanBase>>;

export const TrainingPeriod = t.union([
  t.literal("daily"),
  t.literal("weekly"),
  t.literal("monthly"),
]);

export type TrainingPeriodType = Readonly<t.TypeOf<typeof TrainingPeriod>>;

export const TrainingGoal = t.union([
  t.literal("gain_weight"),
  t.literal("lose_weight"),
  t.literal("gain_mussels"),
  t.literal("stress_relief"),
]);

export type TrainingGoalType = Readonly<t.TypeOf<typeof TrainingGoal>>;

export const TrainingPlanRequest = t.exact(
  t.intersection([
    t.type({
      period: TrainingPeriod,
      goal: TrainingGoal,
    }),
    t.partial({}),
  ])
);

export type TrainingPlanRequestType = Readonly<
  t.TypeOf<typeof TrainingPlanRequest>
>;

export const TrainingPlanResponse = t.exact(
  t.intersection([
    TrainingPlanBase,
    t.type({
      id: t.string,
    }),
  ])
);

export type TrainingPlanResponseType = t.TypeOf<typeof TrainingPlanResponse>;
