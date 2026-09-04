import React from 'react';
import { ScreenContainer } from '../../components/ui';
import { WalkthroughCarousel } from '../../components/onboarding/WalkthroughCarousel';
import { useOnboardingStore } from '../../stores/onboarding.store';

export const WelcomeScreen = ({ navigation }: any) => {
  const { setHasCompletedTutorial } = useOnboardingStore();

  const handleGetStarted = () => {
    setHasCompletedTutorial(true);
    navigation.navigate('Login', { mode: 'register' });
  };

  const handleLogin = () => {
    setHasCompletedTutorial(true);
    navigation.navigate('Login', { mode: 'login' });
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <WalkthroughCarousel
        onGetStarted={handleGetStarted}
        onComplete={handleLogin}
        onSkip={handleGetStarted}
      />
    </ScreenContainer>
  );
};

