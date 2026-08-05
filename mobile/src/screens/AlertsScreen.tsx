import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react-native';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';

export function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { lang, name, tier, score, flags, advice } = useMerchantStore();
  const t = L[lang];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Bell size={20} color="#1E293B" />
          <Text style={styles.headerTitle}>{t.alertsTitle}</Text>
        </View>
        <Text style={styles.headerSubtitle}>{t.alertsSub}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Business Health Status Badge */}
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <View style={styles.healthTitleRow}>
              <ShieldCheck size={18} color="#1E293B" />
              <Text style={styles.healthLabel}>{t.healthStatusLabel}</Text>
            </View>
            <View style={[styles.tierChip, tier === 'AMBER' && styles.tierAmber, tier === 'GREEN' && styles.tierGreen, tier === 'RED' && styles.tierRed]}>
              <Text style={styles.tierChipText}>{t.tiers[tier]} · {score}/100</Text>
            </View>
          </View>
          <Text style={styles.businessNameText}>{name}</Text>
          <Text style={styles.healthSubtext}>{t.healthDesc}</Text>
        </View>

        {/* Risk Flags Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.activeFlagsTitle(flags.length)}</Text>
        </View>

        {flags.map((flag, idx) => (
          <View key={flag.key || idx} style={styles.flagCard}>
            <View style={styles.flagTitleRow}>
              <AlertTriangle size={16} color="#B45309" />
              <Text style={styles.flagTagText}>{flag.tag}</Text>
            </View>
            <Text style={styles.flagDetailText}>{flag.detail}</Text>
          </View>
        ))}

        {/* Suggested Actions & Advice */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.suggestedActionsTitle}</Text>
        </View>

        {advice.map((item, idx) => (
          <View key={idx} style={styles.adviceCard}>
            <View style={styles.adviceHeaderRow}>
              <Lightbulb size={16} color="#2563EB" />
              <Text style={styles.adviceNumberText}>{t.recNumber(idx + 1)}</Text>
            </View>
            <Text style={styles.adviceContentText}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tierChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierAmber: {
    backgroundColor: '#FEF3C7',
  },
  tierGreen: {
    backgroundColor: '#DCFCE7',
  },
  tierRed: {
    backgroundColor: '#FEE2E2',
  },
  tierChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  businessNameText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  healthSubtext: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  flagCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  flagTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  flagTagText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '700',
  },
  flagDetailText: {
    color: '#78350F',
    fontSize: 11,
    lineHeight: 16,
  },
  adviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  adviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  adviceNumberText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  adviceContentText: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
  },
});
