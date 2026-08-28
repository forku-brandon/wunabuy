import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface ScreenContainerProps {
  scrollable?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  refreshControl?: React.ReactElement;
  onRefresh?: () => void;
  refreshing?: boolean;
  children: React.ReactNode;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  scrollable = true,
  padded = true,
  style,
  contentContainerStyle,
  refreshControl,
  onRefresh,
  refreshing = false,
  children,
}) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const handleDefaultRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      setInternalRefreshing(true);
      setTimeout(() => setInternalRefreshing(false), 800);
    }
  }, [onRefresh]);

  const containerStyle: ViewStyle = {
    backgroundColor: theme.background,
    paddingTop: insets.top,
  };

  const paddingStyle: ViewStyle = padded
    ? { paddingHorizontal: spacing.base }
    : {};

  const isCurrentlyRefreshing = refreshing || internalRefreshing;

  const refreshElement =
    refreshControl ?? (
      <RefreshControl
        refreshing={isCurrentlyRefreshing}
        onRefresh={handleDefaultRefresh}
        tintColor={colors.primary[500]}
        colors={[colors.primary[500]]}
      />
    );

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
          refreshControl={refreshElement}
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
