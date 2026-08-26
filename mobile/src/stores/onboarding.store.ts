import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasCompletedTutorial: boolean;
  setHasCompletedTutorial: (completed: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedTutorial: false,
      setHasCompletedTutorial: (completed) => set({ hasCompletedTutorial: completed }),
    }),
    {
      name: '@wunabuy_onboarding_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
