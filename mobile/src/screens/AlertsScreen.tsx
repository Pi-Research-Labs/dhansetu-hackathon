import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react-native';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';

export function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { lang, name, tier, score, flags, advice, fetchMerchantData } = useMerchantStore();
  const t = L[lang];

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMerchantData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMerchantData();
  }, []);

  // Dynamic colors for risk flags based on current tier
  const flagBg = tier === 'GREEN' ? '#E7F2E7' : tier === 'AMBER' ? '#FBF0D9' : '#F8E6E2';
  const flagBorder = tier === 'GREEN' ? '#E7E5DA' : tier === 'AMBER' ? '#C7770033' : '#C0392B33';
  const flagText = tier === 'GREEN' ? '#2E7D32' : tier === 'AMBER' ? '#C77700' : '#C0392B';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Bell size={20} color="#2E7D32" />
          <Text style={styles.headerTitle}>{t.alertsTitle}</Text>
        </View>
        <Text style={styles.headerSubtitle}>{t.alertsSub}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
        }
      >
        {/* Business Health Status Badge */}
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <View style={styles.healthTitleRow}>
              <ShieldCheck size={18} color="#2E7D32" />
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
          <View key={flag.key || idx} style={[styles.flagCard, { backgroundColor: flagBg, borderColor: flagBorder }]}>
            <View style={styles.flagTitleRow}>
              <AlertTriangle size={16} color={flagText} />
              <Text style={[styles.flagTagText, { color: flagText }]}>{flag.tag}</Text>
            </View>
            <Text style={[styles.flagDetailText, { color: '#1D261F' }]}>{flag.detail}</Text>
          </View>
        ))}

        {/* Suggested Actions & Advice */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.suggestedActionsTitle}</Text>
        </View>

        {advice.map((item, idx) => (
          <View key={idx} style={styles.adviceCard}>
            <View style={styles.adviceHeaderRow}>
              <Lightbulb size={16} color="#2E7D32" />
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
    backgroundColor: '#FAFAF5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
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
    color: '#1D261F',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#6F6B5E',
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
    borderColor: '#E7E5DA',
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
    color: '#6F6B5E',
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
    backgroundColor: '#FBF0D9',
  },
  tierGreen: {
    backgroundColor: '#E7F2E7',
  },
  tierRed: {
    backgroundColor: '#F8E6E2',
  },
  tierChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D261F',
  },
  businessNameText: {
    color: '#1D261F',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  healthSubtext: {
    color: '#6F6B5E',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '700',
  },
  flagCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  flagTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  flagTagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  flagDetailText: {
    fontSize: 11,
    lineHeight: 16,
  },
  adviceCard: {
    backgroundColor: '#FAFAF5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7E5DA',
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
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },
  adviceContentText: {
    color: '#1D261F',
    fontSize: 12,
    lineHeight: 18,
  },
});
