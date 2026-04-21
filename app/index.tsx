import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export default function Index() {
  const { user, hasCompletedOnboarding } = useAuthStore();

  // If not logged in, go to auth
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // If logged in but hasn't completed onboarding, go to tutorial
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)/tutorial" />;
  }

  // Otherwise, go to main app
  return <Redirect href="/(tabs)/home" />;
}
