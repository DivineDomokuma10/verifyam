import { create } from "zustand";

import { IUserResponse } from "@/interface";

interface IAuthStore {
  user: IUserResponse | null;

  clearAuthData: () => void;
  mutateAuthData: (data: IUserResponse) => void;
}

const AuthStore = create<IAuthStore>()((set) => ({
  user: null,
  clearAuthData: () => set({ user: null }),
  mutateAuthData: (data) => set({ user: data }),
}));

export default AuthStore;