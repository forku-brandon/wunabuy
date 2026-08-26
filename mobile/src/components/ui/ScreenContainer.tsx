import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ViewStyle,
} from 'react-native';
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

  const containerStyle: ViewStyle = {
    backgroundColor: theme.background,
  };

  const paddingStyle: ViewStyle = padded
    ? { paddingHorizontal: spacing.base }
    : {};

  return (
    <SafeAreaView style={[styles.safeArea, containerStyle, style]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
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
    </SafeAreaView>
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

