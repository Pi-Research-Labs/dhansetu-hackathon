import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Store,
  TrendingUp,
  Calendar,
  ShieldAlert,
  MapPin,
} from 'lucide-react-native';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { MarketPriceChart } from '@/components/charts/MarketPriceChart';
import {
  getMarketIntelligence,
  MarketIntelligenceDetail,
} from '@/utils/api-config';

export function MarketScreen() {
  const insets = useSafeAreaInsets();
  const { lang, enterpriseId } = useMerchantStore();
  const t = L[lang];

  const [intel, setIntel] = useState<MarketIntelligenceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch market intelligence on mount (scoped automatically to the merchant's enterprise)
  useEffect(() => {
    setLoading(true);
    getMarketIntelligence({
      enterpriseId: enterpriseId || undefined,
    })
      .then((data) => {
        setIntel(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching market intelligence:', err);
        setLoading(false);
      });
  }, [enterpriseId]);

  if (loading && !intel) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading Market Intelligence...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Store size={22} color="#2E7D32" />
          <Text style={styles.headerTitle}>{t.marketTitle}</Text>
        </View>
        <Text style={styles.headerSubtitle}>{t.marketSub}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Industry / Sub Type Title */}
        <View style={styles.industryHeader}>
          <Text style={styles.industryText}>
            Industry: <Text style={styles.industryBold}>{intel?.sub_type}</Text>
          </Text>
        </View>

        {/* Location / District Indicator */}
        {intel?.district && (
          <View style={styles.districtBadge}>
            <MapPin size={12} color="#6F6B5E" style={{ marginRight: 4 }} />
            <Text style={styles.districtText}>
              District: <Text style={styles.districtBold}>{intel.district}</Text>
            </Text>
          </View>
        )}

        {/* Main KPI Card */}
        <View style={styles.kpiContainer}>
          <View style={[styles.kpiCard, { marginRight: 6 }]}>
            <Text style={styles.cardLabel}>{t.trackedCommodity}</Text>
            <Text style={styles.kpiTitle}>{intel?.tracked_commodity}</Text>
            <View style={styles.liveTagRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>{t.liveFeed}</Text>
            </View>
          </View>
          <View style={[styles.kpiCard, { marginLeft: 6 }]}>
            <Text style={styles.cardLabel}>12-MO PRICE TREND</Text>
            <Text style={[styles.kpiValue, intel && intel.price_trend_12m_pct < 0 ? styles.textDown : styles.textUp]}>
              {intel && intel.price_trend_12m_pct > 0 ? `+${intel.price_trend_12m_pct}%` : `${intel?.price_trend_12m_pct}%`}
            </Text>
            <Text style={styles.trendSubLabel}>vs baseline index</Text>
          </View>
        </View>

        {/* ECharts Dynamic Dual Axis Chart */}
        <MarketPriceChart chartData={intel?.chart_data} />

        {/* Productivity Outlook */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <TrendingUp size={16} color="#2E7D32" />
            <Text style={styles.cardHeaderTitle}>{t.productivityTitle}</Text>
          </View>
          <Text style={styles.cardDescText}>{intel?.productivity_outlook}</Text>
        </View>

        {/* Seasonal Pattern */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Calendar size={16} color="#1565C0" />
            <Text style={styles.cardHeaderTitle}>{t.seasonalTitle}</Text>
          </View>
          <Text style={styles.cardDescText}>{intel?.seasonal_pattern}</Text>
        </View>

        {/* Climate & Market Risks */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ShieldAlert size={16} color="#C0392B" />
            <Text style={styles.cardHeaderTitle}>{t.climateRisksTitle}</Text>
          </View>

          {intel?.risks.map((r, idx) => (
            <View key={idx} style={styles.riskItem}>
              <View style={styles.riskHeader}>
                <Text style={styles.riskTag}>{r.risk_type}</Text>
                <View style={[
                  styles.sevBadge,
                  r.severity === 'high' ? styles.sevHigh : r.severity === 'medium' ? styles.sevMed : styles.sevLow
                ]}>
                  <Text style={styles.sevText}>{t.severityLabel(r.severity)}</Text>
                </View>
              </View>
              <Text style={styles.riskDesc}>{r.detail}</Text>
            </View>
          ))}
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6F6B5E',
    fontSize: 13,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
  },
  headerTitleRow: {
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
  industryHeader: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5DA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  industryText: {
    fontSize: 13,
    color: '#6F6B5E',
  },
  industryBold: {
    fontWeight: '700',
    color: '#2E7D32',
  },
  districtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginLeft: 2,
  },
  districtText: {
    fontSize: 12,
    color: '#6F6B5E',
  },
  districtBold: {
    fontWeight: '700',
    color: '#1D261F',
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    justifyContent: 'space-between',
  },
  kpiTitle: {
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  trendSubLabel: {
    fontSize: 9,
    color: '#6F6B5E',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardLabel: {
    color: '#6F6B5E',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
  },
  liveTagText: {
    color: '#2E7D32',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardHeaderTitle: {
    color: '#1D261F',
    fontSize: 13,
    fontWeight: '700',
  },
  cardDescText: {
    color: '#1D261F',
    fontSize: 12,
    lineHeight: 18,
  },
  riskItem: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E7E5DA',
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  riskTag: {
    color: '#1D261F',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
  },
  sevBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sevHigh: {
    backgroundColor: '#F8E6E2',
  },
  sevMed: {
    backgroundColor: '#FBF0D9',
  },
  sevLow: {
    backgroundColor: '#FAFAF5',
  },
  sevText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1D261F',
  },
  riskDesc: {
    color: '#6F6B5E',
    fontSize: 11,
    lineHeight: 16,
  },
  textUp: {
    color: '#2E7D32',
  },
  textDown: {
    color: '#C0392B',
  },
});
