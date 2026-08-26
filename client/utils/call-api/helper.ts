export const assertEnv = (env: string, message?: string): string => {
  const msg = message ?? "Please provide the required env variable!";

  if (!env) throw new Error(msg);

  return env;
};

export const getHeaderConfig = <P = unknown>(payload?: P) => {
  if (payload === undefined || isFormData(payload)) {
    return { Accept: "application/json" };
  }

  if (isObject(payload)) {
    return { "Content-Type": "application/json", Accept: "application/json" };
  }

  return { Accept: "application/json" };
};

export const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

export const isFormData = (value: unknown): value is FormData => {
  return value instanceof FormData;
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  const isRegularObj = typeof value === "object" && value !== null;
  return isRegularObj && !isFormData(value) && !isArray(value);
};
