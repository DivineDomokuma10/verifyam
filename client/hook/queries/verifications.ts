import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import VerificationApi, { TVerifyListingPayload } from "@/api/verifications";

export const useCreateVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-verification"],
    mutationFn: async (payload: TVerifyListingPayload) =>
      await VerificationApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["verifications"] });
    },
  });
};

export const useGetVerification = (id?: string) => {
  return useQuery({
    queryKey: ["verification", id],
    queryFn: async () => await VerificationApi.get(id!),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.error || query.state.data?.data?.status === "completed"
        ? false
        : 5000,
  });
};

export const useListVerifications = () => {
  return useQuery({
    queryKey: ["verifications"],
    queryFn: async () => await VerificationApi.list(),
    refetchInterval: (query) =>
      query.state.data?.data?.some((item) => item.status !== "completed")
        ? 5000
        : false,
  });
};

export const useParseListing = () => {
  return useMutation({
    mutationKey: ["parse-listing"],
    mutationFn: async (url: string) => await VerificationApi.parse(url),
  });
};
