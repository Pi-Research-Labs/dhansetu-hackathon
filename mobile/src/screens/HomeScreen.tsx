import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  CreditCard,
  Banknote,
} from 'lucide-react-native';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { WeeklyCashflowChart } from '@/components/charts/WeeklyCashflowChart';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    lang,
    name,
    segment,
    district,
    phone,
    gstin,
    tier,
    score,
    net90,
    savings,
    runwayMonths,
    missedEmi,
    loan,
    emi,
    upiShare,
    appShare,
    cashShare,
    weeklyHistory,
    entries,
    fetchMerchantData,
  } = useMerchantStore();

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

  const formatCurrency = (amount: number) => {
    const isNeg = amount < 0;
    const absVal = Math.abs(amount).toLocaleString('en-IN');
    return isNeg ? `-₹ ${absVal}` : `₹ ${absVal}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <View style={styles.govBadge}>
          <Landmark size={18} color="#2E7D32" />
          <View>
            <Text style={styles.govTitle}>GOVERNMENT OF INDIA</Text>
            <Text style={styles.portalTitle}>{t.portalTitle}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
        }
      >
        {/* Merchant Profile Card */}
        <View style={styles.merchantCard}>
          <View style={styles.merchantCardHeader}>
            <View style={styles.verifiedChip}>
              <ShieldCheck size={14} color="#2E7D32" />
              <Text style={styles.verifiedText}>GST Verified</Text>
            </View>
            <View style={[styles.tierBadge, tier === 'AMBER' && styles.tierAmber, tier === 'GREEN' && styles.tierGreen, tier === 'RED' && styles.tierRed]}>
              <Text style={styles.tierText}>{t.tiers[tier]} · {score}/100</Text>
            </View>
          </View>

          <Text style={styles.merchantName}>{name}</Text>
          <Text style={styles.locationText}>{segment} · {district} · GSTIN: {gstin}</Text>
          <Text style={styles.phoneText}>Phone: {phone}</Text>

          {/* 4 Financial Core Metrics */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.last90}</Text>
              <Text style={[styles.statValue, net90 < 0 && styles.textRed]}>{formatCurrency(net90)}</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.savBal}</Text>
              <Text style={styles.statValue}>{formatCurrency(savings)}</Text>
              <Text style={styles.statSubText}>{runwayMonths} {t.runwaySuffix}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.loanOut}</Text>
              <Text style={styles.statValue}>{loan ? formatCurrency(loan) : t.noLoan}</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.mEmi}</Text>
              <Text style={[styles.statValue, missedEmi >= 1 && styles.textRed]}>
                {emi ? formatCurrency(emi) : '—'}
              </Text>
              {missedEmi >= 1 && <Text style={styles.statSubWarn}>{missedEmi} {t.missedEmiSuffix}</Text>}
            </View>
          </View>
        </View>

        {/* EMI Warning Banner */}
        {missedEmi >= 1 && (
          <View style={styles.warningBanner}>
            <AlertTriangle size={18} color="#C0392B" />
            <Text style={styles.warningBannerText}>
              {t.emiBanner(missedEmi)}
            </Text>
          </View>
        )}

        {/* ECharts Weekly Cashflow Chart */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t.weeklyRecordTitle}</Text>
            <Text style={styles.sectionSubtitle}>{t.weeklyRecordSub}</Text>
          </View>
          <WeeklyCashflowChart data={weeklyHistory} />
        </View>

        {/* Collection Channels Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t.channelsTitle}</Text>
          <Text style={styles.channelSubtitle}>{t.channelsSub}</Text>

          <View style={styles.channelBarContainer}>
            <View style={[styles.channelBarSegment, { width: `${upiShare * 100}%`, backgroundColor: '#2E7D32' }]} />
            <View style={[styles.channelBarSegment, { width: `${appShare * 100}%`, backgroundColor: '#1565C0' }]} />
            <View style={[styles.channelBarSegment, { width: `${cashShare * 100}%`, backgroundColor: '#C9CDBF' }]} />
          </View>

          <View style={styles.channelLegendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
              <Smartphone size={12} color="#6F6B5E" />
              <Text style={styles.legendText}>{t.upiLabel} ({Math.round(upiShare * 100)}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#1565C0' }]} />
              <CreditCard size={12} color="#6F6B5E" />
              <Text style={styles.legendText}>{t.appsLabel} ({Math.round(appShare * 100)}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#C9CDBF' }]} />
              <Banknote size={12} color="#6F6B5E" />
              <Text style={styles.legendText}>{t.cashLabel} ({Math.round(cashShare * 100)}%)</Text>
            </View>
          </View>
        </View>

        {/* Recorded Entries Ledger */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t.recordedEntriesTitle}</Text>
            <TouchableOpacity onPress={() => router.push('/add-entry')}>
              <Text style={styles.actionLinkText}>{t.addNew}</Text>
            </TouchableOpacity>
          </View>

          {entries.length === 0 ? (
            <Text style={styles.emptyLedgerText}>{t.noEntries}</Text>
          ) : (
            entries.slice(0, 5).map((en) => (
              <View key={en.id} style={styles.entryRowItem}>
                <View style={styles.entryMainInfo}>
                  <Text style={styles.entryTypeTitle}>{t.entryTypes[en.type] || en.type}</Text>
                  <Text style={styles.entryNoteText}>{en.note}</Text>
                </View>
                <View style={styles.entryAmountInfo}>
                  <Text style={[styles.entryAmtText, en.type === 'expense' || en.type === 'emi' ? styles.textRed : styles.textGreen]}>
                    {en.type === 'expense' || en.type === 'emi' ? `-₹ ${en.amount.toLocaleString('en-IN')}` : `+₹ ${en.amount.toLocaleString('en-IN')}`}
                  </Text>
                  <Text style={styles.entryDateText}>{en.date}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
    backgroundColor: '#FFFFFF',
  },
  govBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  govTitle: {
    color: '#6F6B5E',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  portalTitle: {
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '700',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E7F2E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  merchantCard: {
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
  merchantCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F2E7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  verifiedText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '600',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
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
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D261F',
  },
  merchantName: {
    color: '#1D261F',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  locationText: {
    color: '#6F6B5E',
    fontSize: 12,
    marginTop: 2,
  },
  phoneText: {
    color: '#6F6B5E',
    fontSize: 11,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FAFAF5',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  statLabel: {
    color: '#6F6B5E',
    fontSize: 11,
    fontWeight: '500',
  },
  statValue: {
    color: '#1D261F',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  statSubText: {
    color: '#6F6B5E',
    fontSize: 10,
    marginTop: 2,
  },
  statSubWarn: {
    color: '#C0392B',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  textRed: {
    color: '#C0392B',
  },
  textAmber: {
    color: '#C77700',
  },
  textGreen: {
    color: '#2E7D32',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8E6E2',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C0392B33',
    marginBottom: 16,
  },
  warningBannerText: {
    color: '#C0392B',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#6F6B5E',
    fontSize: 11,
  },
  actionLinkText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  channelSubtitle: {
    color: '#6F6B5E',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 12,
  },
  channelBarContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#E7E5DA',
    marginBottom: 12,
  },
  channelBarSegment: {
    height: '100%',
  },
  channelLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#6F6B5E',
    fontSize: 11,
    fontWeight: '500',
  },
  emptyLedgerText: {
    color: '#6F6B5E',
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  entryRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
  },
  entryMainInfo: {
    flex: 1,
  },
  entryTypeTitle: {
    color: '#1D261F',
    fontSize: 13,
    fontWeight: '600',
  },
  entryNoteText: {
    color: '#6F6B5E',
    fontSize: 11,
    marginTop: 2,
  },
  entryAmountInfo: {
    alignItems: 'flex-end',
  },
  entryAmtText: {
    fontSize: 13,
    fontWeight: '700',
  },
  entryDateText: {
    color: '#6F6B5E',
    fontSize: 10,
    marginTop: 2,
  },
});
