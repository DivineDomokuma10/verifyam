import { useQuery } from "@tanstack/react-query";

import AuthApi from "@/api/auth";

export const useGetMe = () => {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => await AuthApi.getMe(),
  });
};