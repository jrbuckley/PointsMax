import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { emptyBalances } from "../constants/programs";
import type { GoalPreference, RewardBalance } from "../types/models";

type AppState = {
  hasCompletedOnboarding: boolean;
  goalPreference: GoalPreference;
  rewardBalances: RewardBalance[];
  setHasCompletedOnboarding: (v: boolean) => void;
  setGoalPreference: (v: GoalPreference) => void;
  setRewardBalances: (balances: RewardBalance[]) => void;
  resetOnboarding: () => void;
  clearAllData: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      goalPreference: "KEEP_IT_SIMPLE",
      rewardBalances: emptyBalances(),
      setHasCompletedOnboarding: (v) => set({ hasCompletedOnboarding: v }),
      setGoalPreference: (v) => set({ goalPreference: v }),
      setRewardBalances: (balances) => set({ rewardBalances: balances }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
      clearAllData: () =>
        set({
          hasCompletedOnboarding: false,
          goalPreference: "KEEP_IT_SIMPLE",
          rewardBalances: emptyBalances(),
        }),
    }),
    {
      name: "points-exchange-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        hasCompletedOnboarding: s.hasCompletedOnboarding,
        goalPreference: s.goalPreference,
        rewardBalances: s.rewardBalances,
      }),
    },
  ),
);
