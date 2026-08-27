import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface ScreenContainerProps {
  scrollable?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  children: React.ReactNode;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  scrollable = true,
  padded = true,
  style,
  contentContainerStyle,
  children,
}) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    backgroundColor: theme.background,
    paddingTop: insets.top,
  };

  const paddingStyle: ViewStyle = padded
    ? { paddingHorizontal: spacing.base }
    : {};

  return (
    <View style={[styles.safeArea, containerStyle, style]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      {scrollable ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            paddingStyle,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, paddingStyle, contentContainerStyle]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing['2xl'],
  },
});
