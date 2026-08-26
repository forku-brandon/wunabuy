import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '@wunabuy/design-tokens';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  theme: Theme;

  // Actions
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      isDark: false,
      theme: lightTheme,

      setMode: (mode) => {
        const isDark = mode === 'dark';
        set({
          mode,
          isDark,
          theme: isDark ? darkTheme : lightTheme,
        });
      },

      toggleTheme: () => {
        const currentIsDark = get().isDark;
        const newIsDark = !currentIsDark;
        set({
          mode: newIsDark ? 'dark' : 'light',
          isDark: newIsDark,
          theme: newIsDark ? darkTheme : lightTheme,
        });
      },
    }),
    {
      name: '@wunabuy_theme_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

