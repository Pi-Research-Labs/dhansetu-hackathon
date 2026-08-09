import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Bell, AlertTriangle, Lightbulb, ShieldCheck, Brain, CheckCircle2, Check } from 'lucide-react-native';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';

export function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { lang, name, tier, score, flags, advice, riskPrediction, fetchMerchantData, hasUnreadAlerts, markAlertsAsRead } = useMerchantStore();
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

  // Mark alerts as read on focus
  useFocusEffect(
    React.useCallback(() => {
      markAlertsAsRead();
    }, [markAlertsAsRead])
  );

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
          </View>
          <Text style={styles.businessNameText}>{name}</Text>
          <Text style={styles.healthSubtext}>{t.healthDesc}</Text>
        </View>

        {/* AI Predictive Risk Card */}
        {riskPrediction && (
          <View style={styles.predictiveCard}>
            <View style={styles.predictiveHeader}>
              <Brain size={18} color="#2E7D32" />
              <Text style={styles.predictiveTitle}>AI Predictive Analysis (Model Snapshot)</Text>
            </View>
            <View style={styles.predictiveDivider} />
            <View style={styles.predictiveGrid}>
              <View style={styles.predictiveBox}>
                <Text style={styles.predictiveLabel}>Stress Prob</Text>
                <Text style={[styles.predictiveValue, riskPrediction.prob_stress > 0.4 ? styles.textRed : styles.textGreen]}>
                  {(riskPrediction.prob_stress * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.predictiveBox}>
                <Text style={styles.predictiveLabel}>Default Prob</Text>
                <Text style={[styles.predictiveValue, riskPrediction.prob_missed_repayment > 0.1 ? styles.textRed : styles.textGreen]}>
                  {(riskPrediction.prob_missed_repayment * 100).toFixed(2)}%
                </Text>
              </View>
              <View style={styles.predictiveBox}>
                <Text style={styles.predictiveLabel}>Model Score</Text>
                <Text style={styles.predictiveValue}>
                  {(riskPrediction.fused_score * 100).toFixed(0)}/100
                </Text>
              </View>
            </View>
            <Text style={styles.modelMetaText}>
              Model ID: {riskPrediction.model_id} · Rules: {riskPrediction.rule_version}
            </Text>
          </View>
        )}

        {/* Risk Flags Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t.activeFlagsTitle(flags.length)}</Text>
          {hasUnreadAlerts ? (
            <TouchableOpacity onPress={markAlertsAsRead} style={styles.markReadBtn} activeOpacity={0.7}>
              <Text style={styles.markReadText}>Mark all as read</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.allReadBadge}>
              <Check size={11} color="#2E7D32" style={{ marginRight: 2 }} />
              <Text style={styles.allReadText}>All Read</Text>
            </View>
          )}
        </View>

        {flags.map((flag, idx) => (
          <View key={flag.key || idx} style={[styles.flagCard, { borderLeftColor: flagText }]}>
            <View style={styles.flagTitleRow}>
              <View style={styles.flagTitleMain}>
                <AlertTriangle size={15} color={flagText} />
                <Text style={[styles.flagTagText, { color: flagText }]}>{flag.tag}</Text>
              </View>
              {hasUnreadAlerts ? (
                <View style={styles.newAlertBadge}>
                  <Text style={styles.newAlertText}>NEW</Text>
                </View>
              ) : (
                <View style={styles.monitoredBadge}>
                  <Text style={styles.monitoredText}>Monitored</Text>
                </View>
              )}
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
              <View style={styles.checkboxCircle}>
                <Check size={10} color="#2E7D32" />
              </View>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '700',
  },
  markReadBtn: {
    backgroundColor: '#E7F2E7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  markReadText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '700',
  },
  allReadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  allReadText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
  },
  flagCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  flagTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  flagTitleMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagTagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  newAlertBadge: {
    backgroundColor: '#F8E6E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newAlertText: {
    color: '#C0392B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  monitoredBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  monitoredText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
  },
  flagDetailText: {
    color: '#1D261F',
    fontSize: 11,
    lineHeight: 16,
  },
  adviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
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
  checkboxCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
    backgroundColor: '#E7F2E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceNumberText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  adviceContentText: {
    color: '#1D261F',
    fontSize: 12,
    lineHeight: 18,
  },
  predictiveCard: {
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
  predictiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  predictiveTitle: {
    color: '#1D261F',
    fontSize: 13,
    fontWeight: '700',
  },
  predictiveDivider: {
    height: 1,
    backgroundColor: '#E7E5DA',
    marginVertical: 12,
  },
  predictiveGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  predictiveBox: {
    flex: 1,
    backgroundColor: '#FAFAF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    padding: 10,
    alignItems: 'center',
  },
  predictiveLabel: {
    color: '#6F6B5E',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  predictiveValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D261F',
  },
  modelMetaText: {
    color: '#94A3B8',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
  },
  textRed: {
    color: '#C0392B',
  },
  textGreen: {
    color: '#2E7D32',
  },
});
