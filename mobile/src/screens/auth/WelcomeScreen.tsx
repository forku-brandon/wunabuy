import React from 'react';
import { ScreenContainer } from '../../components/ui';
import { WalkthroughCarousel } from '../../components/onboarding/WalkthroughCarousel';
import { useOnboardingStore } from '../../stores/onboarding.store';

export const WelcomeScreen = ({ navigation }: any) => {
  const { setHasCompletedTutorial } = useOnboardingStore();

  const handleComplete = () => {
    setHasCompletedTutorial(true);
    navigation.navigate('Login');
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <WalkthroughCarousel
        onComplete={handleComplete}
        onSkip={handleComplete}
      />
    </ScreenContainer>
  );
};

