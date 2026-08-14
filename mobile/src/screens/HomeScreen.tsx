import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  CreditCard,
  Banknote,
  BookOpen,
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
    receivables,
    todaysTotals,
    creditHeadroom,
    bridgeHeadroom,
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
    const absVal = Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    return isNeg ? `-₹ ${absVal}` : `₹ ${absVal}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <View style={styles.govBadge}>
          <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#E7F2E7', borderWidth: 1, borderColor: '#E7E5DA', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 4 }}>
            <Image
              source={require('../../assets/splash-icon.png')}
              style={{ width: 26, height: 26, borderRadius: 25, resizeMode: 'cover' }}
            />
          </View>
          <View>
            <Text style={styles.govTitle}>DHANSETU</Text>
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
              <Text style={styles.verifiedText}>{t.gstVerified}</Text>
            </View>
          </View>

          <Text style={styles.merchantName}>{name}</Text>

          {/* 4 Financial Core Metrics */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.last90}</Text>
              <Text style={[styles.statValue, net90 < 0 && styles.textRed]}>{formatCurrency(net90)}</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.savBal}</Text>
              <Text style={styles.statValue}>{formatCurrency(savings)}</Text>
              <Text style={styles.statSubText}>{Number(runwayMonths.toFixed(2))} {t.runwaySuffix}</Text>
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
                {emi ? formatCurrency(emi) : '0'}
              </Text>
              {missedEmi >= 1 && <Text style={styles.statSubWarn}>{missedEmi} {t.missedEmiSuffix}</Text>}
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.creditHeadroom}</Text>
              <Text style={[styles.statValue, styles.textGreen]}>{formatCurrency(creditHeadroom)}</Text>
              <Text style={styles.statSubText}>Term credit capacity</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.bridgeHeadroom}</Text>
              <Text style={[styles.statValue, styles.textGreen]}>{formatCurrency(bridgeHeadroom)}</Text>
              <Text style={styles.statSubText}>Bridge credit capacity</Text>
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
              <Text style={styles.legendText}>{t.walletLabel} ({Math.round(appShare * 100)}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#C9CDBF' }]} />
              <Banknote size={12} color="#6F6B5E" />
              <Text style={styles.legendText}>{t.cashLabel} ({Math.round(cashShare * 100)}%)</Text>
            </View>
          </View>
        </View>

        {/* Receivables/Udhaar Book Card */}
        {receivables && receivables.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <BookOpen size={16} color="#2E7D32" />
                <Text style={styles.sectionTitle}>{t.receivablesTitle}</Text>
              </View>
            </View>
            <Text style={styles.channelSubtitle}>{t.receivablesSub}</Text>

            {receivables.map((item, idx) => (
              <View key={idx} style={styles.receivableRow}>
                <View style={styles.receivableMain}>
                  <Text style={styles.receivableType}>
                    {t.counterpartyTypes[item.counterparty_type] ||
                      item.counterparty_type.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.receivableInvoiceCount}>
                    {item.invoices} Invoices · Avg {item.avg_days_to_cash} Days to Cash
                  </Text>
                </View>
                <View style={styles.receivableValues}>
                  <Text style={styles.receivableTotal}>₹ {item.total.toLocaleString('en-IN')}</Text>
                  {item.written_off > 0 && (
                    <Text style={styles.receivableWriteOff}>
                      Written-Off: ₹ {item.written_off.toLocaleString('en-IN')} ({item.write_off_pct}%)
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Today's Entry Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t.todaysEntryTitle}</Text>
            <TouchableOpacity onPress={() => router.push('/add-entry')}>
              <Text style={styles.actionLinkText}>{t.addNew}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.todayTotalsGrid}>
            <View style={styles.todayTotalBox}>
              <View style={styles.todayHeaderRow}>
                <Text style={styles.todayBoxLabel}>{t.inflowLabel}</Text>
              </View>
              <Text style={[styles.todayBoxValue, styles.textGreen]}>
                +₹ {(todaysTotals?.total_inflow ?? 0).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.todayBoxSubText}>
                {t.todayTotalLabel(
                  `₹ ${(todaysTotals?.total_inflow ?? 0).toLocaleString('en-IN')}`,
                  `₹ ${(todaysTotals?.live_inflow ?? 0).toLocaleString('en-IN')}`
                )}
              </Text>
            </View>

            <View style={styles.todayTotalBox}>
              <View style={styles.todayHeaderRow}>
                <Text style={styles.todayBoxLabel}>{t.outflowLabel}</Text>
              </View>
              <Text style={[styles.todayBoxValue, styles.textRed]}>
                -₹ {(todaysTotals?.total_outflow ?? 0).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.todayBoxSubText}>
                {t.todayTotalLabel(
                  `₹ ${(todaysTotals?.total_outflow ?? 0).toLocaleString('en-IN')}`,
                  `₹ ${(todaysTotals?.live_outflow ?? 0).toLocaleString('en-IN')}`
                )}
              </Text>
            </View>
          </View>
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
  merchantName: {
    color: '#1D261F',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 8,
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
  receivableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
  },
  receivableMain: {
    flex: 1,
  },
  receivableType: {
    color: '#1D261F',
    fontSize: 12,
    fontWeight: '700',
  },
  receivableInvoiceCount: {
    color: '#6F6B5E',
    fontSize: 10,
    marginTop: 2,
  },
  receivableValues: {
    alignItems: 'flex-end',
  },
  receivableTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D261F',
  },
  receivableWriteOff: {
    color: '#C0392B',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  todayTotalsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  todayTotalBox: {
    flex: 1,
    backgroundColor: '#FAFAF5',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  todayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  todayBoxLabel: {
    color: '#6F6B5E',
    fontSize: 11,
    fontWeight: '600',
  },
  todayBoxValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  todayBoxSubText: {
    color: '#6F6B5E',
    fontSize: 10,
    marginTop: 4,
    lineHeight: 13,
  },
});
