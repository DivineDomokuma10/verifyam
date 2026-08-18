import { useMutation } from "@tanstack/react-query";

import AuthApi from "@/api/auth";
import { TLoginFormValues, TSignupFormValues } from "@/types/schema-derived";

export const useSignupMutation = () => {
  return useMutation({
    mutationKey: ["signup"],
    mutationFn: async (payload: TSignupFormValues) =>
      await AuthApi.signup(payload),
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (payload: TLoginFormValues) =>
      await AuthApi.login(payload),
  });
};