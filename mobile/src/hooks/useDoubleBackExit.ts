import { useEffect, useRef } from 'react';
import { Platform, BackHandler, ToastAndroid } from 'react-native';

/**
 * Custom Hook: Intercepts Android hardware back button.
 * Pressing back once shows a native toast notice.
 * Pressing back twice within 2 seconds exits the app completely.
 */
export function useDoubleBackExit() {
  const backPressCountRef = useRef(0);
  const backTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleBackPress = () => {
      if (backPressCountRef.current === 0) {
        backPressCountRef.current = 1;
        if (Platform.OS === 'android') {
          ToastAndroid.show('Press back again to exit app', ToastAndroid.SHORT);
        }

        if (backTimerRef.current) clearTimeout(backTimerRef.current);
        backTimerRef.current = setTimeout(() => {
          backPressCountRef.current = 0;
        }, 2000);

        return true; // Intercept & block back navigation
      } else {
        if (backTimerRef.current) clearTimeout(backTimerRef.current);
        BackHandler.exitApp();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      backHandler.remove();
      if (backTimerRef.current) clearTimeout(backTimerRef.current);
    };
  }, []);
}
