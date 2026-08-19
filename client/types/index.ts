import { IVerificationResultChecks } from "@/interface";

export type THttpMethod = "GET" | "POST";

export type TResponseType = "json" | "blob";

export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type TApiResponse<T> = TApiSuccess<T> | TApiError;

export type TApiSuccess<T> = {
  data: T;
  message: string;
  status: "success";
};

export type TApiError = {
  message: string;
  status: "error";
};

export type CheckField = Exclude<
  keyof IVerificationResultChecks,
  "scamSignals" | "notes"
>;
