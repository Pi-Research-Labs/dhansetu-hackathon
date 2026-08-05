import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Landmark } from 'lucide-react-native';
import { TricolorBar } from '@/components/common/TricolorBar';

export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Replace route so user cannot press back to return to Splash
      router.replace('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <TricolorBar />

      <View style={styles.content}>
        {/* Government Emblem Badge */}
        <View style={styles.emblemContainer}>
          <View style={styles.emblemIconCircle}>
            <Landmark size={36} color="#1E293B" />
          </View>
          <Text style={styles.govTitle}>GOVERNMENT OF INDIA</Text>
          <Text style={styles.ministryTitle}>MINISTRY OF COMMERCE & INDUSTRY</Text>
        </View>

        {/* App Branding */}
        <View style={styles.brandingContainer}>
          <Text style={styles.devanagariTitle}>धनसेतु</Text>
          <Text style={styles.brandTitle}>DhanSetu</Text>
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>OFFICIAL MERCHANT PORTAL</Text>
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
        <Text style={styles.versionText}>v1.0.0 (Build 57) • Government Gateway</Text>
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
  devanagariTitle: {
    color: '#1E293B',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
  brandTitle: {
    color: '#0F172A',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: -2,
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
