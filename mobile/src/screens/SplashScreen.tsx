import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';

const DHANSETU_LANGS = [
  'DhanSetu',
  'धनसेतु',
  'धनसेतू',
  'ధనసేతు',
  'DhanSetu',
];
const ITEM_HEIGHT = 48;
import { ShieldCheck, Landmark } from 'lucide-react-native';
import { useMerchantStore } from '@/store/useMerchantStore';

export function SplashScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    const animateNext = (index: number) => {
      if (!isMounted) return;

      Animated.timing(scrollY, {
        toValue: -index * ITEM_HEIGHT,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        if (!isMounted) return;

        // Wait 2 seconds before animating the next language
        setTimeout(() => {
          if (!isMounted) return;

          if (index >= DHANSETU_LANGS.length - 1) {
            // Instant reset to index 0 (English)
            scrollY.setValue(0);
            animateNext(1);
          } else {
            animateNext(index + 1);
          }
        }, 2000);
      });
    };

    // Start the vertical scrolling sequence
    const startTimeout = setTimeout(() => {
      animateNext(1);
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
    };
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      const { restoreSession } = useMerchantStore.getState();
      const isRestored = await restoreSession();

      // Delay navigation slightly to let splash branding render
      setTimeout(() => {
        if (isRestored) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }, 1500);
    };

    initializeSession();
  }, []);

  return (
    <View style={styles.container}>


      <View style={styles.content}>
        {/* Emblem Badge */}
        <View style={styles.emblemContainer}>
          <View style={styles.emblemIconCircle}>
            <Image
              source={require('../../assets/icon.png')}
              style={{ width: 44, height: 44 }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.govTitle}>DHANSETU</Text>
          <Text style={styles.ministryTitle}>VERIFIED MERCHANT GATEWAY</Text>
        </View>

        {/* App Branding */}
        <View style={styles.brandingContainer}>
          <View style={styles.carouselContainer}>
            <Animated.View style={{ transform: [{ translateY: scrollY }] }}>
              {DHANSETU_LANGS.map((lang, idx) => (
                <View key={idx} style={styles.carouselItem}>
                  <Text style={styles.carouselText}>{lang}</Text>
                </View>
              ))}
            </Animated.View>
          </View>
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>OFFICIAL DHANSETU MERCHANT PORTAL</Text>
          </View>
        </View>

        {/* Loading & Verification */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#1E293B" />
          <Text style={styles.loaderText}>Establishing Secure Session...</Text>
          <View style={styles.securityBadge}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={styles.securityText}>256-Bit SSL Encrypted • Digital India</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Designed for Verified Indian Merchants & Enterprises</Text>
        <Text style={styles.versionText}>v1.0.0 (Build 57) • Secure Gateway</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emblemContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emblemIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  govTitle: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  ministryTitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  carouselContainer: {
    height: ITEM_HEIGHT,
    overflow: 'hidden',
    width: '100%',
  },
  carouselItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselText: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  pillBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  pillText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loaderText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 10,
    letterSpacing: 0.2,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
  },
  securityText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  versionText: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '400',
  },
});
