export const missingParameter = (name: string): never => {
  throw new Error(`configuration parameter name '${name}' is missing`);
};

export const createParams = (params: NodeJS.ProcessEnv) => ({
  idHashLength:
    Number(params.WORKOUT_ID_HASH_LENGTH) ??
    missingParameter("WORKOUT_ID_HASH_LENGTH"),
});

export const params = createParams(process.env);
