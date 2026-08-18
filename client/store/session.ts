import { create } from "zustand";

import AuthApi from "@/api/auth";

type TSession = { userId: string };

interface ISessionStore {
  isLoading: boolean;
  session: TSession | null;

  initSession: () => Promise<void>;
  setLoading: (data: boolean) => void;
  mutateSession: (data: TSession | null) => void;
}

const SessionStore = create<ISessionStore>()((set) => ({
  isLoading: true,

  session: null,
  setLoading: (data) => set({ isLoading: data }),

  mutateSession: (data) => set({ session: data }),

  initSession: async () => {
    set({ isLoading: true });

    try {
      const res = await AuthApi.getMe();

      if (res.data) {
        set({ session: { userId: res.data.id } });
      } else {
        set({ session: null });
      }
    } catch {
      set({ session: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default SessionStore;