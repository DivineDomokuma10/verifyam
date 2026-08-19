import { useMutation, useQuery } from "@tanstack/react-query";

import VerificationApi, { TVerifyListingPayload } from "@/api/verifications";

export const useCreateVerification = () => {
  return useMutation({
    mutationKey: ["create-verification"],
    mutationFn: async (payload: TVerifyListingPayload) =>
      await VerificationApi.create(payload),
  });
};

export const useGetVerification = (id?: string) => {
  return useQuery({
    queryKey: ["verification", id],
    queryFn: async () => await VerificationApi.get(id!),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data?.data?.status === "completed" ? false : 5000,
  });
};

export const useListVerifications = () => {
  return useQuery({
    queryKey: ["verifications"],
    queryFn: async () => await VerificationApi.list(),
  });
};

export const useParseListing = () => {
  return useMutation({
    mutationKey: ["parse-listing"],
    mutationFn: async (url: string) => await VerificationApi.parse(url),
  });
};